# Amazon Creators API Node for n8n

Community node for the Amazon Creators API (Offers V2) using OAuth2 client credentials. Supports GetItems, SearchItems, and GetBrowseNodes with resource selection.

## Features
- Creators API OAuth2 auth flow (credential ID/secret + version)
- OffersV2 listings (price, availability, merchant, deal details, buy box)
- Item info, images, reviews, browse nodes
- Structured output with optional price summary
- Retry/backoff for throttling and transient errors
- SearchItems pagination support (itemPage)

## Installation
```bash
npm install n8n-nodes-amazon-creators-api
```

## Credentials
Create new credentials in n8n:
- **Type**: Amazon Creators API
- **Credential ID**
- **Credential Secret**
- **Credential Version** (2.1/2.2/2.3)
- **Marketplace** (e.g., www.amazon.com)
- **Partner Tag**

## Notes
- Uses `Authorization: Bearer <token>, Version <version>` and `x-marketplace` header.
- Resources are lowercase (e.g., `offersV2.listings.price`).

## Build
```bash
npm install
npm run build
```

## Local testing without npm install
If you run n8n globally, you can load the built node with `N8N_CUSTOM_EXTENSIONS`:

```bash
export N8N_CUSTOM_EXTENSIONS=/Volumes/HD/Dev/n8n/n8n-amazon-creators-api/dist
n8n start
```

Path should point to your local `n8n-amazon-creators-api` folder, e.g.:
`/Volumes/HD/Dev/n8n/n8n-amazon-creators-api/dist`.
