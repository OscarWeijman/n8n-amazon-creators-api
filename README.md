# Amazon PA-API Enhanced Node voor n8n

Een verbeterde n8n node voor de Amazon Product Advertising API (PA-API 5.0) met volledige ondersteuning voor alle Resources en betere beveiliging.

## 🚀 Nieuwe Functies

### ✅ Volledige Resources Ondersteuning
In tegenstelling tot de originele `n8n-nodes-amazon-paapi` node, ondersteunt onze enhanced versie **alle** PA-API 5.0 Resources:

- **ItemInfo.Title** - Producttitel
- **ItemInfo.Features** - Productkenmerken en bullet points
- **ItemInfo.ContentInfo** - Content informatie (pagina's, talen, etc.)
- **ItemInfo.TechnicalInfo** - Technische specificaties (merk, model, etc.)
- **ItemInfo.ProductInfo** - Productinformatie (kleur, maat, etc.)
- **Images.Primary** - Primaire productafbeelding
- **Images.Variants** - Aanvullende productafbeeldingen
- **Offers.Listings** - Prijs- en beschikbaarheidsinformatie
- **Offers.Summaries** - Prijssamenvattingen
- **ParentASIN** - Parent ASIN voor variaties
- **BrowseNodeInfo** - Categorie-informatie
- **CustomerReviews** - Klantbeoordelingen

### 🔒 Verbeterde Beveiliging
- Veilige opslag van credentials met password masking
- Betere error handling en validatie
- Input sanitization en validatie

### 🎯 Verbeterde Functionaliteit
- **Marketplace ondersteuning** - Inclusief Nederland (amazon.nl)
- **Geavanceerde filtering** - Conditie, merchant, valuta, taal
- **Gestructureerde output** - Schone, georganiseerde productdata
- **Batch processing** - Meerdere ASINs tegelijk ophalen
- **Flexibele configuratie** - Kies precies welke data je wilt

## 🔒 Beveiliging

### ⚠️ **BELANGRIJK: Credentials Beveiliging**

**NOOIT** je echte Amazon PA-API credentials committen naar Git! 

- Gebruik altijd placeholder waarden in voorbeelden
- Roteer je credentials regelmatig
- Gebruik environment variables voor productie
- Monitor je API usage in de Amazon Partner Central

### 🔐 **Veilige Credential Management**

```bash
# Voorbeeld .env bestand (NIET committen!)
AMAZON_ACCESS_KEY=your-access-key-here
AMAZON_SECRET_KEY=your-secret-key-here  
AMAZON_PARTNER_TAG=your-partner-tag-here
```

## 📦 Installatie

### Lokale Installatie
```bash
# Clone het project
git clone <repository-url>
cd n8n-amazon-paapi-enhanced

# Installeer dependencies
npm install

# Build de node
npm run build

# Installeer in je n8n omgeving
npm install /path/to/n8n-amazon-paapi-enhanced
```

### Docker Installatie
```bash
# Kopieer naar container
docker cp . n8n:/tmp/n8n-amazon-paapi-enhanced

# Installeer in container
docker exec n8n sh -c "cd /home/node/.n8n/nodes && npm install /tmp/n8n-amazon-paapi-enhanced"

# Herstart n8n
docker restart n8n
```

## 🔧 Configuratie

### 1. Credentials Aanmaken
Maak nieuwe credentials aan in n8n:
- **Type**: Amazon PA-API Enhanced
- **Access Key ID**: Je Amazon PA-API Access Key
- **Secret Access Key**: Je Amazon PA-API Secret Key
- **Partner Tag**: Je Amazon Associate ID
- **Marketplace**: Kies je marketplace (bijv. www.amazon.nl)

### 2. Node Configuratie
1. Voeg de "Amazon PA-API Enhanced" node toe aan je workflow
2. Selecteer je credentials
3. Kies de gewenste operatie:
   - **Get Items**: Haal productinfo op via ASIN(s)
   - **Search Items**: Zoek producten met keywords
   - **Get Browse Nodes**: Haal categorie-informatie op

### 3. Resources Selecteren
Kies welke productinformatie je wilt ontvangen:
- Voor **prijzen**: Selecteer "Offers - Listings" en "Offers - Summaries"
- Voor **afbeeldingen**: Selecteer "Images - Primary" en "Images - Variants"
- Voor **productdetails**: Selecteer "Item Info - Features" en "Item Info - Technical Info"

## 📊 Output Structuur

De node retourneert gestructureerde data:

```json
{
  "operation": "getItems",
  "itemCount": 1,
  "items": [
    {
      "asin": "B08N5WRWNW",
      "title": "Product Title",
      "features": ["Feature 1", "Feature 2"],
      "primaryImage": {
        "small": "https://...",
        "medium": "https://...",
        "large": "https://..."
      },
      "offers": [
        {
          "price": "€29.99",
          "currency": "EUR",
          "availability": "In Stock",
          "condition": "New",
          "merchant": "Amazon.nl",
          "isPrime": true
        }
      ],
      "priceSummary": [
        {
          "condition": "New",
          "lowestPrice": "€29.99",
          "highestPrice": "€39.99",
          "offerCount": 5
        }
      ]
    }
  ]
}
```

## 🆚 Vergelijking met Originele Node

| Feature | Originele Node | Enhanced Node |
|---------|---------------|---------------|
| Resources Support | ❌ Beperkt (alleen titel) | ✅ Volledig (alle PA-API resources) |
| Prijsinformatie | ❌ Ontbreekt | ✅ Volledig (Offers.Listings + Summaries) |
| Afbeeldingen | ❌ Ontbreekt | ✅ Volledig (Primary + Variants) |
| Nederlandse Marketplace | ❌ Ontbreekt | ✅ Ondersteund (amazon.nl) |
| Gestructureerde Output | ❌ Raw API response | ✅ Schone, georganiseerde data |
| Error Handling | ❌ Basis | ✅ Uitgebreid met validatie |
| Security | ❌ Basis | ✅ Password masking + validatie |

## 🔍 Voorbeelden

### Voorbeeld 1: Product Details Ophalen
```
Operation: Get Items
Item IDs: B08N5WRWNW
Resources: 
- ItemInfo.Title
- ItemInfo.Features  
- Images.Primary
- Offers.Listings
```

### Voorbeeld 2: Producten Zoeken
```
Operation: Search Items
Keywords: wireless headphones
Search Index: Electronics
Item Count: 10
Resources:
- ItemInfo.Title
- Images.Primary
- Offers.Summaries
```

## 🛠️ Development

### Project Structuur
```
n8n-amazon-paapi-enhanced/
├── credentials/
│   └── AmazonPaApiEnhanced.credentials.ts
├── nodes/
│   └── AmazonPAEnhanced/
│       ├── AmazonPAEnhanced.node.ts
│       └── amazon.svg
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Build Commands
```bash
npm run build          # Compile TypeScript + copy icons
npm run dev            # Watch mode for development
npm run lint           # ESLint checking
npm run format         # Prettier formatting
```

## 📝 Licentie

MIT License - Zie LICENSE bestand voor details.

## 🤝 Bijdragen

Bijdragen zijn welkom! Open een issue of submit een pull request.

## 📞 Support

Voor vragen of problemen, open een issue in de GitHub repository.
