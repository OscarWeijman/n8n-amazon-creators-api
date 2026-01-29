# Credentials

Creators API uses OAuth2 client credentials, not PA-API keys.

Required fields in n8n:
- Credential ID
- Credential Secret
- Credential Version (2.1/2.2/2.3)
- Marketplace (e.g. www.amazon.com)
- Partner Tag
- Custom Auth Endpoint (optional)

Notes
- If you only have PA-API Access/Secret, requests will fail with 400.
- Version controls the OAuth2 token endpoint.
