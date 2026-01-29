# Troubleshooting

## 400 Bad Request
Most common cause is using old PA-API credentials.
Creators API requires Credential ID/Secret and version (OAuth2).

## 401 Unauthorized
- Wrong Credential ID/Secret
- Wrong credential version for your region
- Partner tag not valid for marketplace

## 403 Forbidden
- Account not enabled for Creators API
- Missing permissions for the operation

## Empty offers
- Offers V2 only returns listings if requested via resources
- Verify you included offersV2.listings.* resources
