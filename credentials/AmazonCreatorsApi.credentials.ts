import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AmazonCreatorsApi implements ICredentialType {
	name = 'amazonCreatorsApi';
	displayName = 'Amazon Creators API';
	documentationUrl = 'https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction';
	properties: INodeProperties[] = [
		{
			displayName: 'Credential ID',
			name: 'credentialId',
			type: 'string',
			default: '',
			required: true,
			description: 'Creators API credential ID',
		},
		{
			displayName: 'Credential Secret',
			name: 'credentialSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Creators API credential secret',
		},
		{
			displayName: 'Credential Version',
			name: 'credentialVersion',
			type: 'options',
			options: [
				{ name: 'NA (2.1)', value: '2.1' },
				{ name: 'EU (2.2)', value: '2.2' },
				{ name: 'FE (2.3)', value: '2.3' },
			],
			default: '2.1',
			required: true,
			description: 'OAuth2 token version for your region',
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
		{
			displayName: 'Custom Auth Endpoint',
			name: 'authEndpoint',
			type: 'string',
			default: '',
			required: false,
			description: 'Optional OAuth2 token endpoint override (leave empty for default)',
		},
	];
}
