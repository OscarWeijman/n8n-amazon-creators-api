import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

// @ts-ignore
import * as amazonPaapi from 'amazon-paapi';

export class AmazonPAEnhanced implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Amazon PA-API Enhanced',
		name: 'amazonPAEnhanced',
		icon: 'file:amazon.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Enhanced Amazon Product Advertising API with full Resources support',
		defaults: {
			name: 'Amazon PA-API Enhanced',
			color: '#FF9900',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'amazonPaApiEnhanced',
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

			// Get Items Parameters
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

			// Search Items Parameters
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
				type: 'options',
				displayOptions: {
					show: {
						operation: ['searchItems'],
					},
				},
				options: [
					{ name: 'All', value: 'All' },
					{ name: 'Electronics', value: 'Electronics' },
					{ name: 'Books', value: 'Books' },
					{ name: 'Clothing', value: 'Fashion' },
					{ name: 'Home & Kitchen', value: 'HomeAndKitchen' },
					{ name: 'Sports & Outdoors', value: 'SportsAndOutdoors' },
					{ name: 'Toys & Games', value: 'ToysAndGames' },
					{ name: 'Beauty', value: 'Beauty' },
					{ name: 'Automotive', value: 'Automotive' },
					{ name: 'Health & Personal Care', value: 'HealthPersonalCare' },
				],
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

			// Browse Nodes Parameters
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

			// Resources Configuration
			{
				displayName: 'Resources to Include',
				name: 'resources',
				type: 'multiOptions',
				options: [
					{
						name: 'Item Info - Title',
						value: 'ItemInfo.Title',
						description: 'Product title',
					},
					{
						name: 'Item Info - Features',
						value: 'ItemInfo.Features',
						description: 'Product features and bullet points',
					},
					{
						name: 'Item Info - Content Info',
						value: 'ItemInfo.ContentInfo',
						description: 'Content information (pages, languages, etc.)',
					},
					{
						name: 'Item Info - Technical Info',
						value: 'ItemInfo.TechnicalInfo',
						description: 'Technical specifications',
					},
					{
						name: 'Item Info - Product Info',
						value: 'ItemInfo.ProductInfo',
						description: 'Product information (color, size, etc.)',
					},
					{
						name: 'Images - Primary Small',
						value: 'Images.Primary.Small',
						description: 'Primary product image (small)',
					},
					{
						name: 'Images - Primary Medium',
						value: 'Images.Primary.Medium',
						description: 'Primary product image (medium)',
					},
					{
						name: 'Images - Primary Large',
						value: 'Images.Primary.Large',
						description: 'Primary product image (large)',
					},
					{
						name: 'Images - Variants',
						value: 'Images.Variants.Small',
						description: 'Additional product images (small)',
					},
					{
						name: 'Offers - Listings Price',
						value: 'Offers.Listings.Price',
						description: 'Price information',
					},
					{
						name: 'Offers - Listings Availability',
						value: 'Offers.Listings.Availability.Message',
						description: 'Availability information',
					},
					{
						name: 'Offers - Listings Condition',
						value: 'Offers.Listings.Condition',
						description: 'Item condition',
					},
					{
						name: 'Offers - Summaries',
						value: 'Offers.Summaries.HighestPrice',
						description: 'Price summaries',
					},
					{
						name: 'Parent ASIN',
						value: 'ParentASIN',
						description: 'Parent ASIN for variations',
					},
					{
						name: 'Browse Node Info',
						value: 'BrowseNodeInfo.BrowseNodes',
						description: 'Category information',
					},
					{
						name: 'Customer Reviews',
						value: 'CustomerReviews.Count',
						description: 'Customer review count',
					},
					{
						name: 'Customer Reviews Rating',
						value: 'CustomerReviews.StarRating',
						description: 'Customer review rating',
					},
				],
				default: [
					'ItemInfo.Title',
					'Images.Primary.Medium',
					'Offers.Listings.Price',
				],
				description: 'Select which product information to retrieve',
			},

			// Advanced Options
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
							{ name: 'Used', value: 'Used' },
							{ name: 'Collectible', value: 'Collectible' },
							{ name: 'Refurbished', value: 'Refurbished' },
						],
						default: 'Any',
						description: 'Item condition filter',
					},
					{
						displayName: 'Merchant',
						name: 'merchant',
						type: 'options',
						options: [
							{ name: 'All', value: 'All' },
							{ name: 'Amazon', value: 'Amazon' },
						],
						default: 'All',
						description: 'Merchant filter',
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
						displayName: 'Language of Preference',
						name: 'languageOfPreference',
						type: 'string',
						default: '',
						description: 'Language code (e.g., en_US, de_DE, nl_NL)',
						placeholder: 'nl_NL',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('amazonPaApiEnhanced');

		console.log('Credentials received:', {
			accessKey: credentials.accessKey ? `${credentials.accessKey.toString().substring(0, 5)}...` : 'MISSING',
			secretKey: credentials.secretKey ? `${credentials.secretKey.toString().substring(0, 5)}...` : 'MISSING',
			partnerTag: credentials.partnerTag,
			marketplace: credentials.marketplace
		});

		const commonParameters = {
			AccessKey: credentials.accessKey as string,
			SecretKey: credentials.secretKey as string,
			PartnerTag: credentials.partnerTag as string,
			Marketplace: credentials.marketplace as string,
			PartnerType: 'Associates' as const,
		};

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const resources = this.getNodeParameter('resources', i) as string[];
				const additionalFields = this.getNodeParameter('additionalFields', i) as any;

				const requestParameters: any = {};

				// Only add Resources if they are selected
				if (resources && resources.length > 0) {
					requestParameters.Resources = resources;
				} else {
					// Default resources if none selected
					requestParameters.Resources = ['ItemInfo.Title'];
				}

				// Add additional fields if specified
				if (additionalFields.condition) {
					requestParameters.Condition = additionalFields.condition;
				}
				if (additionalFields.merchant) {
					requestParameters.Merchant = additionalFields.merchant;
				}
				if (additionalFields.currencyOfPreference) {
					requestParameters.CurrencyOfPreference = additionalFields.currencyOfPreference;
				}
				if (additionalFields.languageOfPreference) {
					requestParameters.LanguageOfPreference = additionalFields.languageOfPreference;
				}

				let responseData: any;

				switch (operation) {
					case 'getItems': {
						const itemIds = this.getNodeParameter('itemIds', i) as string;
						if (!itemIds.trim()) {
							throw new NodeOperationError(this.getNode(), 'Item IDs are required');
						}
						
						requestParameters.ItemIds = itemIds
							.split(',')
							.map(id => id.trim())
							.filter(id => id.length > 0);
						
						// Required for GetItems operation
						requestParameters.ItemIdType = 'ASIN';

						if (requestParameters.ItemIds.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one valid Item ID is required');
						}

						console.log('Making GetItems request with:', {
							commonParameters,
							requestParameters
						});

						try {
							responseData = await amazonPaapi.GetItems(commonParameters, requestParameters);
							console.log('Raw API Response:', responseData);
						} catch (apiError: any) {
							console.error('Amazon API Error Details:', {
								message: apiError.message,
								stack: apiError.stack,
								response: apiError.response,
								data: apiError.data,
								status: apiError.status,
								statusText: apiError.statusText,
								config: apiError.config
							});
							throw new NodeOperationError(this.getNode(), `Amazon API Error: ${JSON.stringify(apiError.message || apiError)}`);
						}
						break;
					}

					case 'searchItems': {
						const keywords = this.getNodeParameter('keywords', i) as string;
						const searchIndex = this.getNodeParameter('searchIndex', i) as string;
						const itemCount = this.getNodeParameter('itemCount', i) as number;

						if (!keywords.trim()) {
							throw new NodeOperationError(this.getNode(), 'Keywords are required');
						}

						requestParameters.Keywords = keywords.trim();
						requestParameters.SearchIndex = searchIndex;
						requestParameters.ItemCount = itemCount;

						console.log('Making SearchItems request with:', {
							commonParameters,
							requestParameters
						});

						try {
							responseData = await amazonPaapi.SearchItems(commonParameters, requestParameters);
							console.log('Raw API Response:', responseData);
						} catch (apiError: any) {
							console.error('Amazon API Error:', apiError);
							throw new NodeOperationError(this.getNode(), `Amazon API Error: ${apiError.message || apiError}`);
						}
						break;
					}

					case 'getBrowseNodes': {
						const browseNodeIds = this.getNodeParameter('browseNodeIds', i) as string;
						if (!browseNodeIds.trim()) {
							throw new NodeOperationError(this.getNode(), 'Browse Node IDs are required');
						}

						requestParameters.BrowseNodeIds = browseNodeIds
							.split(',')
							.map(id => id.trim())
							.filter(id => id.length > 0);

						if (requestParameters.BrowseNodeIds.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one valid Browse Node ID is required');
						}

						responseData = await amazonPaapi.GetBrowseNodes(commonParameters, requestParameters);
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				// Process and clean up the response
				console.log('Processing response data:', responseData);
				
				if (!responseData) {
					throw new NodeOperationError(this.getNode(), 'No response data received from Amazon API');
				}

				try {
					const nodeInstance = new AmazonPAEnhanced();
					const processedData = nodeInstance.processApiResponse(responseData, operation);
					returnData.push({ json: processedData });
				} catch (processingError: any) {
					console.error('Error processing response:', processingError);
					// Fallback to raw response if processing fails
					returnData.push({ 
						json: {
							operation,
							rawResponse: responseData,
							processingError: processingError.message,
							success: true
						}
					});
				}

			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						error: error as NodeOperationError,
					});
				} else {
					throw new NodeOperationError(this.getNode(), `Amazon PA-API request failed: ${error.message}`);
				}
			}
		}

		return [returnData];
	}

	processApiResponse(responseData: any, operation: string): any {
		try {
			// Parse the response if it's a string
			let parsedResponse = responseData;
			if (typeof responseData === 'string') {
				parsedResponse = JSON.parse(responseData);
			}

			// Extract the relevant data based on operation
			let items: any[] = [];
			
			switch (operation) {
				case 'getItems':
					if (parsedResponse.ItemsResult && parsedResponse.ItemsResult.Items) {
						items = parsedResponse.ItemsResult.Items;
					}
					break;
				case 'searchItems':
					if (parsedResponse.SearchResult && parsedResponse.SearchResult.Items) {
						items = parsedResponse.SearchResult.Items;
					}
					break;
				case 'getBrowseNodes':
					if (parsedResponse.BrowseNodesResult && parsedResponse.BrowseNodesResult.BrowseNodes) {
						items = parsedResponse.BrowseNodesResult.BrowseNodes;
					}
					break;
			}

			// Process each item to extract useful information
			const nodeInstance = new AmazonPAEnhanced();
			const processedItems = items.map(item => nodeInstance.processItem(item));

			return {
				operation,
				itemCount: processedItems.length,
				items: processedItems,
				rawResponse: parsedResponse, // Include raw response for debugging
			};

		} catch (error) {
			return {
				operation,
				error: 'Failed to process API response',
				rawResponse: responseData,
			};
		}
	}

	processItem(item: any): any {
		const processed: any = {
			asin: item.ASIN,
		};

		// Extract title
		if (item.ItemInfo?.Title?.DisplayValue) {
			processed.title = item.ItemInfo.Title.DisplayValue;
		}

		// Extract features
		if (item.ItemInfo?.Features?.DisplayValues) {
			processed.features = item.ItemInfo.Features.DisplayValues;
		}

		// Extract images
		if (item.Images?.Primary) {
			processed.primaryImage = {
				small: item.Images.Primary.Small?.URL,
				medium: item.Images.Primary.Medium?.URL,
				large: item.Images.Primary.Large?.URL,
			};
		}

		if (item.Images?.Variants) {
			processed.additionalImages = item.Images.Variants.map((variant: any) => ({
				small: variant.Small?.URL,
				medium: variant.Medium?.URL,
				large: variant.Large?.URL,
			}));
		}

		// Extract pricing information
		if (item.Offers?.Listings) {
			processed.offers = item.Offers.Listings.map((listing: any) => ({
				price: listing.Price?.DisplayAmount,
				currency: listing.Price?.Currency,
				savings: listing.SavingBasis?.DisplayAmount,
				availability: listing.Availability?.Message,
				condition: listing.Condition?.Value,
				merchant: listing.MerchantInfo?.Name,
				isPrime: listing.DeliveryInfo?.IsPrimePantryEligible,
			}));
		}

		if (item.Offers?.Summaries) {
			processed.priceSummary = item.Offers.Summaries.map((summary: any) => ({
				condition: summary.Condition?.Value,
				lowestPrice: summary.LowestPrice?.DisplayAmount,
				highestPrice: summary.HighestPrice?.DisplayAmount,
				offerCount: summary.OfferCount,
			}));
		}

		// Extract additional product info
		if (item.ItemInfo?.ProductInfo) {
			processed.productInfo = {
				color: item.ItemInfo.ProductInfo.Color?.DisplayValue,
				size: item.ItemInfo.ProductInfo.Size?.DisplayValue,
				unitCount: item.ItemInfo.ProductInfo.UnitCount?.DisplayValue,
			};
		}

		// Extract technical info
		if (item.ItemInfo?.TechnicalInfo) {
			processed.technicalInfo = {
				brand: item.ItemInfo.TechnicalInfo.Brand?.DisplayValue,
				manufacturer: item.ItemInfo.TechnicalInfo.Manufacturer?.DisplayValue,
				model: item.ItemInfo.TechnicalInfo.Model?.DisplayValue,
			};
		}

		// Extract browse node info
		if (item.BrowseNodeInfo?.BrowseNodes) {
			processed.categories = item.BrowseNodeInfo.BrowseNodes.map((node: any) => ({
				id: node.Id,
				name: node.DisplayName,
				salesRank: node.SalesRank,
			}));
		}

		// Extract customer reviews
		if (item.CustomerReviews) {
			processed.customerReviews = {
				count: item.CustomerReviews.Count,
				starRating: item.CustomerReviews.StarRating?.Value,
			};
		}

		return processed;
	}
}
