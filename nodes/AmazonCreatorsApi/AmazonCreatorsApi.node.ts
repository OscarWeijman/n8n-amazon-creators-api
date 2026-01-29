import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import axios from 'axios';

import { buildPriceSummary, normalizeList, parseRetryAfter, sleep } from './utils';

const TOKEN_ENDPOINTS: Record<string, string> = {
	'2.1': 'https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token',
	'2.2': 'https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token',
	'2.3': 'https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token',
};

const API_BASE_URL = 'https://creatorsapi.amazon';

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

async function getAccessToken(
	credentialId: string,
	credentialSecret: string,
	version: string,
	authEndpoint?: string,
): Promise<string> {
	const cacheKey = `${credentialId}:${version}:${authEndpoint || 'default'}`;
	const cached = tokenCache.get(cacheKey);
	if (cached && Date.now() < cached.expiresAt) {
		return cached.token;
	}

	const tokenUrl = authEndpoint?.trim() || TOKEN_ENDPOINTS[version];
	if (!tokenUrl) {
		throw new Error(`Unsupported credential version: ${version}`);
	}

	const requestBody = new URLSearchParams({
		grant_type: 'client_credentials',
		client_id: credentialId,
		client_secret: credentialSecret,
		scope: 'creatorsapi/default',
	}).toString();

	const response = await axios.post(tokenUrl, requestBody, {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		timeout: 30000,
	});

	const accessToken = response.data?.access_token as string | undefined;
	const expiresIn = response.data?.expires_in as number | undefined;
	if (!accessToken || !expiresIn) {
		throw new Error('No access token received from OAuth2 endpoint');
	}

	const expiresAt = Date.now() + Math.max(expiresIn - 30, 0) * 1000;
	tokenCache.set(cacheKey, { token: accessToken, expiresAt });
	return accessToken;
}

async function postWithRetry(
	url: string,
	body: Record<string, any>,
	options: { headers: Record<string, string>; timeout: number },
	maxRetries: number,
	baseDelayMs: number,
	debugEnabled: boolean,
) {
	let attempt = 0;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		try {
			return await axios.post(url, body, options);
		} catch (error: any) {
			const status = error?.response?.status;
			const retryAfterMs = parseRetryAfter(error?.response?.headers?.['retry-after']);
			const retryable =
				!status || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
			if (!retryable || attempt >= maxRetries) {
				throw error;
			}

			const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
			const jitter = Math.floor(Math.random() * baseDelayMs * 0.2);
			const delayMs = retryAfterMs ?? exponentialDelay + jitter;
			if (debugEnabled) {
				console.warn('[amazon-creators-api] retry', {
					attempt: attempt + 1,
					status,
					delayMs,
				});
			}
			await sleep(delayMs);
			attempt += 1;
		}
	}
}

export class AmazonCreatorsApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Amazon Creators API',
		name: 'amazonCreatorsApi',
		icon: 'file:amazon.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Amazon Creators API (Offers V2) operations for product data',
		defaults: {
			name: 'Amazon Creators API',
			color: '#FF9900',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'amazonCreatorsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: false,
				options: [
					{
						name: 'Get Items',
						value: 'getItems',
						description: 'Get detailed item information by ASIN(s)',
						action: 'Get items by ASIN',
					},
					{
						name: 'Search Items',
						value: 'searchItems',
						description: 'Search for items using keywords',
						action: 'Search for items',
					},
					{
						name: 'Get Browse Nodes',
						value: 'getBrowseNodes',
						description: 'Get browse node information',
						action: 'Get browse nodes',
					},
				],
				default: 'getItems',
			},
			{
				displayName: 'Item IDs (ASINs)',
				name: 'itemIds',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getItems'],
					},
				},
				default: '',
				required: true,
				description: 'Comma-separated list of ASINs (up to 10 items)',
				placeholder: 'B08N5WRWNW,B07XJ8C8F5',
			},
			{
				displayName: 'Keywords',
				name: 'keywords',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['searchItems'],
					},
				},
				default: '',
				required: true,
				description: 'Keywords to search for items',
				placeholder: 'wireless headphones',
			},
			{
				displayName: 'Search Index',
				name: 'searchIndex',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['searchItems'],
					},
				},
				default: 'All',
				description: 'The category to search within',
			},
			{
				displayName: 'Item Count',
				name: 'itemCount',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['searchItems'],
					},
				},
				default: 10,
				typeOptions: {
					minValue: 1,
					maxValue: 50,
				},
				description: 'Number of items to return (1-50)',
			},
			{
				displayName: 'Browse Node IDs',
				name: 'browseNodeIds',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getBrowseNodes'],
					},
				},
				default: '',
				required: true,
				description: 'Comma-separated list of Browse Node IDs',
				placeholder: '283155,1000',
			},
			{
				displayName: 'Resources to Include',
				name: 'resources',
				type: 'multiOptions',
				displayOptions: {
					show: {
						operation: ['getItems', 'searchItems'],
					},
				},
				options: [
					{ name: 'Item Info - Title', value: 'itemInfo.title' },
					{ name: 'Item Info - Features', value: 'itemInfo.features' },
					{ name: 'Item Info - Content Info', value: 'itemInfo.contentInfo' },
					{ name: 'Item Info - Technical Info', value: 'itemInfo.technicalInfo' },
					{ name: 'Item Info - Product Info', value: 'itemInfo.productInfo' },
					{ name: 'Item Info - By Line Info', value: 'itemInfo.byLineInfo' },
					{ name: 'Images - Primary Small', value: 'images.primary.small' },
					{ name: 'Images - Primary Medium', value: 'images.primary.medium' },
					{ name: 'Images - Primary Large', value: 'images.primary.large' },
					{ name: 'Images - Primary Hi-Res', value: 'images.primary.highRes' },
					{ name: 'Images - Variants', value: 'images.variants.small' },
					{ name: 'Images - Variants Medium', value: 'images.variants.medium' },
					{ name: 'Images - Variants Large', value: 'images.variants.large' },
					{ name: 'Images - Variants Hi-Res', value: 'images.variants.highRes' },
					{ name: 'Offers V2 - Listings Price', value: 'offersV2.listings.price' },
					{ name: 'Offers V2 - Listings Availability', value: 'offersV2.listings.availability' },
					{ name: 'Offers V2 - Listings Condition', value: 'offersV2.listings.condition' },
					{ name: 'Offers V2 - Listings Merchant', value: 'offersV2.listings.merchantInfo' },
					{ name: 'Offers V2 - Listings Deal Details', value: 'offersV2.listings.dealDetails' },
					{ name: 'Offers V2 - Listings Loyalty Points', value: 'offersV2.listings.loyaltyPoints' },
					{ name: 'Offers V2 - Listings Type', value: 'offersV2.listings.type' },
					{ name: 'Offers V2 - Listings Buy Box Winner', value: 'offersV2.listings.isBuyBoxWinner' },
					{ name: 'Parent ASIN', value: 'parentASIN' },
					{ name: 'Browse Node Info', value: 'browseNodeInfo.browseNodes' },
					{ name: 'Customer Reviews Count', value: 'customerReviews.count' },
					{ name: 'Customer Reviews Rating', value: 'customerReviews.starRating' },
				],
				default: ['itemInfo.title', 'images.primary.medium', 'offersV2.listings.price'],
				description: 'Select which product information to retrieve',
			},
			{
				displayName: 'Browse Node Resources',
				name: 'browseNodeResources',
				type: 'multiOptions',
				displayOptions: {
					show: {
						operation: ['getBrowseNodes'],
					},
				},
				options: [
					{ name: 'Ancestor', value: 'browseNodes.ancestor' },
					{ name: 'Children', value: 'browseNodes.children' },
				],
				default: [],
				description: 'Select which browse node information to retrieve',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						displayName: 'Condition',
						name: 'condition',
						type: 'options',
						options: [
							{ name: 'Any', value: 'Any' },
							{ name: 'New', value: 'New' },
						],
						default: 'Any',
						description: 'Item condition filter',
					},
					{
						displayName: 'Currency of Preference',
						name: 'currencyOfPreference',
						type: 'string',
						default: '',
						description: 'Currency code (e.g., USD, EUR, GBP)',
						placeholder: 'EUR',
					},
					{
						displayName: 'Languages of Preference',
						name: 'languagesOfPreference',
						type: 'string',
						default: '',
						description: 'Comma-separated locale codes (e.g., en_US, nl_NL)',
						placeholder: 'nl_NL',
					},
					{
						displayName: 'Search Items Page',
						name: 'itemPage',
						type: 'number',
						default: 1,
						description: 'SearchItems page number (1-10)',
						typeOptions: {
							minValue: 1,
							maxValue: 10,
						},
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						type: 'number',
						default: 2,
						description: 'Retry count for throttling/5xx/network errors',
						typeOptions: {
							minValue: 0,
							maxValue: 8,
						},
					},
					{
						displayName: 'Retry Base Delay (ms)',
						name: 'retryDelayMs',
						type: 'number',
						default: 500,
						description: 'Base delay for exponential backoff',
						typeOptions: {
							minValue: 100,
							maxValue: 10000,
						},
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('amazonCreatorsApi');

		const credentialId = (credentials.credentialId as string).trim();
		const credentialSecret = (credentials.credentialSecret as string).trim();
		const credentialVersion = (credentials.credentialVersion as string).trim();
		const marketplace = (credentials.marketplace as string).trim();
		const partnerTag = (credentials.partnerTag as string).trim();
		const authEndpoint = (credentials.authEndpoint as string | undefined)?.trim();
		const debugEnabled = (process.env.N8N_AMAZON_CREATORS_DEBUG || '').toLowerCase() === 'true';
		const debugInfo = debugEnabled
			? {
					credentialIdSuffix: credentialId ? credentialId.slice(-4) : 'MISSING',
					partnerTagSuffix: partnerTag ? partnerTag.slice(-4) : 'MISSING',
					credentialVersion,
					marketplace,
					authEndpoint: authEndpoint || 'default',
				}
			: undefined;
		if (debugInfo) {
			console.log('[amazon-creators-api] creds', debugInfo);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const additionalFields = this.getNodeParameter('additionalFields', i) as {
					condition?: string;
					currencyOfPreference?: string;
					languagesOfPreference?: string;
					itemPage?: number;
					maxRetries?: number;
					retryDelayMs?: number;
				};

				const token = await getAccessToken(
					credentialId,
					credentialSecret,
					credentialVersion,
					authEndpoint,
				);

				const headers = {
					Authorization: `Bearer ${token}, Version ${credentialVersion}`,
					'x-marketplace': marketplace,
					'Content-Type': 'application/json; charset=utf-8',
					'User-Agent': 'n8n-amazon-creators-api/0.1.0',
				};

				const requestBody: Record<string, any> = {
					partnerTag,
				};

				if (additionalFields?.condition) {
					requestBody.condition = additionalFields.condition;
				}
				if (additionalFields?.currencyOfPreference) {
					requestBody.currencyOfPreference = additionalFields.currencyOfPreference;
				}
				if (additionalFields?.languagesOfPreference) {
					requestBody.languagesOfPreference = normalizeList(additionalFields.languagesOfPreference);
				}

				const maxRetries = additionalFields?.maxRetries ?? 2;
				const retryDelayMs = additionalFields?.retryDelayMs ?? 500;

				let endpoint = '';
				let responseData: any;

				switch (operation) {
					case 'getItems': {
						const itemIdsInput = this.getNodeParameter('itemIds', i) as string;
						const itemIds = normalizeList(itemIdsInput);
						if (!itemIds.length) {
							throw new NodeOperationError(this.getNode(), 'At least one valid Item ID is required');
						}

						const resources = this.getNodeParameter('resources', i, []) as string[];
						requestBody.itemIds = itemIds;
						requestBody.resources = resources.length ? resources : ['itemInfo.title'];

						endpoint = '/catalog/v1/getItems';
						break;
					}
					case 'searchItems': {
						const keywords = (this.getNodeParameter('keywords', i) as string).trim();
						if (!keywords) {
							throw new NodeOperationError(this.getNode(), 'Keywords are required');
						}

						const searchIndex = this.getNodeParameter('searchIndex', i) as string;
						const itemCount = this.getNodeParameter('itemCount', i) as number;
						const resources = this.getNodeParameter('resources', i, []) as string[];

						requestBody.keywords = keywords;
						requestBody.searchIndex = searchIndex;
						requestBody.itemCount = itemCount;
						if (additionalFields?.itemPage) {
							requestBody.itemPage = additionalFields.itemPage;
						}
						requestBody.resources = resources.length ? resources : ['itemInfo.title'];

						endpoint = '/catalog/v1/searchItems';
						break;
					}
					case 'getBrowseNodes': {
						const browseNodeIdsInput = this.getNodeParameter('browseNodeIds', i) as string;
						const browseNodeIds = normalizeList(browseNodeIdsInput);
						if (!browseNodeIds.length) {
							throw new NodeOperationError(this.getNode(), 'At least one valid Browse Node ID is required');
						}

						const resources = this.getNodeParameter('browseNodeResources', i, []) as string[];
						requestBody.browseNodeIds = browseNodeIds;
						if (resources.length) {
							requestBody.resources = resources;
						}

						endpoint = '/catalog/v1/getBrowseNodes';
						break;
					}
					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				const response = await postWithRetry(
					`${API_BASE_URL}${endpoint}`,
					requestBody,
					{
						headers,
						timeout: 60000,
					},
					maxRetries,
					retryDelayMs,
					debugEnabled,
				);

				responseData = response.data;

				const nodeInstance = new AmazonCreatorsApi();
				const processed = nodeInstance.processApiResponse(responseData, operation);
				returnData.push({ json: processed });
			} catch (error: any) {
				const status = error?.response?.status;
				const responseBody = error?.response?.data;
				const detailedMessage = status
					? `Creators API request failed (${status}): ${error.message}`
					: `Creators API request failed: ${error.message}`;
				const errorPayload = {
					error: detailedMessage,
					status,
					response: responseBody,
					debug: debugInfo,
				};
				if (debugEnabled) {
					console.error('[amazon-creators-api] error', {
						status,
						response: responseBody,
					});
				}
				if (this.continueOnFail()) {
					returnData.push({ json: errorPayload });
				} else {
					throw new NodeOperationError(this.getNode(), detailedMessage, {
						description: responseBody ? JSON.stringify(responseBody) : undefined,
					});
				}
			}
		}

		return [returnData];
	}

	processApiResponse(responseData: any, operation: string): any {
		if (!responseData) {
			return { operation, itemCount: 0, items: [], rawResponse: responseData };
		}

		let items: any[] = [];
		let meta: Record<string, any> | undefined;
		switch (operation) {
			case 'getItems':
				items = responseData.itemsResult?.items ?? [];
				break;
			case 'searchItems':
				items = responseData.searchResult?.items ?? [];
				meta = {
					totalResultCount: responseData.searchResult?.totalResultCount,
					searchURL: responseData.searchResult?.searchURL,
					searchRefinements: responseData.searchResult?.searchRefinements,
				};
				break;
			case 'getBrowseNodes':
				items = responseData.browseNodesResult?.browseNodes ?? [];
				break;
			default:
				items = [];
		}

		const processedItems = items.map((item) =>
			operation === 'getBrowseNodes' ? this.processBrowseNode(item) : this.processItem(item),
		);

		return {
			operation,
			itemCount: processedItems.length,
			items: processedItems,
			meta,
			rawResponse: responseData,
		};
	}

	processItem(item: any): any {
		const processed: any = {
			asin: item.asin,
			detailPageURL: item.detailPageURL,
		};

		if (item.itemInfo?.title?.displayValue) {
			processed.title = item.itemInfo.title.displayValue;
		}

		if (item.itemInfo?.features?.displayValues) {
			processed.features = item.itemInfo.features.displayValues;
		}

		if (item.images?.primary) {
			processed.primaryImage = {
				small: item.images.primary.small?.url,
				medium: item.images.primary.medium?.url,
				large: item.images.primary.large?.url,
				hiRes: item.images.primary.hiRes?.url,
			};
		}

		if (item.images?.variants) {
			processed.additionalImages = item.images.variants.map((variant: any) => ({
				small: variant.small?.url,
				medium: variant.medium?.url,
				large: variant.large?.url,
				hiRes: variant.hiRes?.url,
			}));
		}

		if (item.offersV2?.listings) {
			processed.offers = item.offersV2.listings.map((listing: any) => ({
				price: listing.price?.money?.displayAmount,
				currency: listing.price?.money?.currency,
				savings: listing.price?.savings?.money?.displayAmount,
				savingBasis: listing.price?.savingBasis?.money?.displayAmount,
				availability: listing.availability?.message,
				condition: listing.condition?.value,
				merchant: listing.merchantInfo?.name,
				isBuyBoxWinner: listing.isBuyBoxWinner,
				offerType: listing.type,
				violatesMAP: listing.violatesMAP,
			}));

			processed.priceSummary = buildPriceSummary(item.offersV2.listings);
		}

		if (item.itemInfo?.productInfo) {
			processed.productInfo = {
				color: item.itemInfo.productInfo.color?.displayValue,
				size: item.itemInfo.productInfo.size?.displayValue,
				unitCount: item.itemInfo.productInfo.unitCount?.displayValue,
			};
		}

		if (item.itemInfo?.byLineInfo) {
			processed.byLineInfo = {
				brand: item.itemInfo.byLineInfo.brand?.displayValue,
				manufacturer: item.itemInfo.byLineInfo.manufacturer?.displayValue,
			};
		}

		if (item.itemInfo?.manufactureInfo) {
			processed.manufactureInfo = {
				model: item.itemInfo.manufactureInfo.model?.displayValue,
				itemPartNumber: item.itemInfo.manufactureInfo.itemPartNumber?.displayValue,
			};
		}

		if (item.browseNodeInfo?.browseNodes) {
			processed.categories = item.browseNodeInfo.browseNodes.map((node: any) => ({
				id: node.id,
				name: node.displayName,
				salesRank: node.salesRank,
			}));
		}

		if (item.customerReviews) {
			processed.customerReviews = {
				count: item.customerReviews.count,
				starRating: item.customerReviews.starRating?.value,
			};
		}

		if (item.parentASIN) {
			processed.parentASIN = item.parentASIN;
		}

		return processed;
	}

	processBrowseNode(node: any): any {
		return {
			id: node.id,
			displayName: node.displayName,
			contextFreeName: node.contextFreeName,
			isRoot: node.isRoot,
			salesRank: node.salesRank,
			ancestor: node.ancestor,
			children: node.children,
		};
	}
}
