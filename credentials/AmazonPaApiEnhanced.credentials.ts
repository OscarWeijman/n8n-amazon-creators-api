import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AmazonPaApiEnhanced implements ICredentialType {
	name = 'amazonPaApiEnhanced';
	displayName = 'Amazon PA-API Enhanced';
	documentationUrl = 'https://webservices.amazon.com/paapi5/documentation/';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key ID',
			name: 'accessKey',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Amazon PA-API Access Key ID',
		},
		{
			displayName: 'Secret Access Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Amazon PA-API Secret Access Key',
		},
		{
			displayName: 'Partner Tag (Associate ID)',
			name: 'partnerTag',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Amazon Associate ID / Partner Tag',
		},
		{
			displayName: 'Marketplace',
			name: 'marketplace',
			type: 'options',
			options: [
				{ name: 'United States', value: 'www.amazon.com' },
				{ name: 'United Kingdom', value: 'www.amazon.co.uk' },
				{ name: 'Germany', value: 'www.amazon.de' },
				{ name: 'France', value: 'www.amazon.fr' },
				{ name: 'Italy', value: 'www.amazon.it' },
				{ name: 'Spain', value: 'www.amazon.es' },
				{ name: 'Netherlands', value: 'www.amazon.nl' },
				{ name: 'Japan', value: 'www.amazon.co.jp' },
				{ name: 'Canada', value: 'www.amazon.ca' },
				{ name: 'Mexico', value: 'www.amazon.com.mx' },
				{ name: 'Brazil', value: 'www.amazon.com.br' },
				{ name: 'India', value: 'www.amazon.in' },
				{ name: 'Australia', value: 'www.amazon.com.au' },
				{ name: 'Singapore', value: 'www.amazon.sg' },
				{ name: 'Turkey', value: 'www.amazon.com.tr' },
				{ name: 'UAE', value: 'www.amazon.ae' },
			],
			default: 'www.amazon.com',
			required: true,
			description: 'The Amazon marketplace you want to use',
		},
	];
}
