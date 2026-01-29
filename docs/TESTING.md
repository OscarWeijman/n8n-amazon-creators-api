# Testing

## Global n8n
```bash
export N8N_CUSTOM_EXTENSIONS=/Volumes/HD/Dev/n8n/n8n-amazon-creators-api/dist
n8n start
```

## Quick checks
- Verify credentials are Creators API credentials.
- Set resources to include offersV2.listings.price for prices.

## Local tests
Build first, then run the node tests:
```bash
npm run build
npm test
```
