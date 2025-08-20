# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-20

### Added
- Initial release of enhanced Amazon PA-API node for n8n
- Complete PA-API 5.0 Resources support with proper resource specifications
- Support for all major Amazon marketplaces including Netherlands (amazon.nl)
- Enhanced security with credential validation and password masking
- Structured output processing for clean, organized product data
- Comprehensive error handling with detailed debugging information
- Support for Get Items, Search Items, and Get Browse Nodes operations
- Advanced filtering options (condition, merchant, currency, language)
- Batch processing support for multiple ASINs (up to 10 items)
- Professional documentation and examples

### Fixed
- Resource specification format (e.g., `Images.Primary.Medium` instead of `Images.Primary`)
- Missing price information (now includes `Offers.Listings.Price`)
- Missing product images (now includes all image sizes)
- Incomplete product data (now supports all available PA-API resources)
- Poor error messages (now provides detailed error information)

### Security
- Implemented secure credential handling
- Added input validation and sanitization
- Removed any hardcoded credentials from source code
- Added comprehensive .gitignore for sensitive files
- Included security guidelines in documentation

## [Unreleased]

### Planned
- Unit tests for all operations
- Integration tests with mock API responses
- Performance optimizations
- Additional marketplace support
- Enhanced documentation with video tutorials
