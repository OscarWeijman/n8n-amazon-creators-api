# Migration from PA-API node

Key differences
- Auth: PA-API uses AWS Access/Secret (SigV4). Creators API uses OAuth2 client credentials.
- Resources: Creators API uses lowercase resource strings (offersV2.*).
- Offers: Offers V2 has listings only. Offers summaries are not returned.

Recommended path
- Keep PA-API node for legacy flows.
- Use the Creators API node for new workflows.
- Re-map offers outputs and update any price summary logic.
