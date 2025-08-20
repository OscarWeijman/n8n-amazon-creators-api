# Contributing to Amazon PA-API Enhanced Node

Thank you for your interest in contributing to this project! We welcome contributions from the community.

## 🤝 How to Contribute

### Reporting Issues
- Use the [GitHub Issues](https://github.com/yourusername/n8n-nodes-amazon-paapi-enhanced/issues) page
- Search existing issues before creating a new one
- Provide detailed information about the bug or feature request
- Include steps to reproduce for bugs

### Submitting Changes
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- n8n development environment
- Amazon PA-API credentials for testing

### Setup
```bash
# Clone your fork
git clone https://github.com/yourusername/n8n-nodes-amazon-paapi-enhanced.git
cd n8n-nodes-amazon-paapi-enhanced

# Install dependencies
npm install

# Build the project
npm run build

# Start development mode
npm run dev
```

### Testing
```bash
# Run linting
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## 📋 Guidelines

### Code Style
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Follow the existing code structure and patterns

### Security
- Never commit real credentials
- Validate all user inputs
- Use secure credential handling
- Follow n8n security best practices

### Documentation
- Update README.md for new features
- Add examples for new functionality
- Update CHANGELOG.md
- Include JSDoc comments

### Testing
- Test with multiple marketplaces
- Verify all Resources work correctly
- Test error handling scenarios
- Ensure backward compatibility

## 🎯 Areas for Contribution

### High Priority
- Unit tests for all operations
- Integration tests with mock responses
- Performance optimizations
- Additional error handling scenarios

### Medium Priority
- Support for more PA-API operations
- Enhanced output formatting options
- Caching mechanisms
- Rate limiting improvements

### Low Priority
- Additional marketplace support
- UI/UX improvements
- Documentation enhancements
- Example workflows

## 📝 Pull Request Process

1. **Description**: Provide a clear description of changes
2. **Testing**: Include test results and screenshots if applicable
3. **Documentation**: Update relevant documentation
4. **Breaking Changes**: Clearly mark any breaking changes
5. **Review**: Be responsive to feedback during review

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Tested with multiple marketplaces
- [ ] All existing tests pass

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No sensitive data included
```

## 🚀 Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release branch
4. Test thoroughly
5. Create GitHub release
6. Publish to npm (maintainers only)

## 📞 Getting Help

- **Questions**: Use [GitHub Discussions](https://github.com/yourusername/n8n-nodes-amazon-paapi-enhanced/discussions)
- **Bugs**: Use [GitHub Issues](https://github.com/yourusername/n8n-nodes-amazon-paapi-enhanced/issues)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for helping make this project better! 🎉
