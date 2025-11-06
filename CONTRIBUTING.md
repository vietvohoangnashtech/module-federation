# Contributing Guide

Thank you for contributing to the Module Federation project! This guide will help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/module-federation.git
   cd module-federation
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Build the CLI:
   ```bash
   cd mfe_cli
   pnpm build
   pnpm prepare-publish
   ```

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run tests:
   ```bash
   pnpm test
   ```

4. Submit a Pull Request

## Documentation

- Update relevant documentation when making changes
- Follow the Markdown style guide
- Keep documentation focused and organized

## Templates

When adding or modifying templates:

1. Test the template thoroughly
2. Include proper TypeScript configuration
3. Add necessary test setup
4. Document template-specific features

## Testing

- Write tests for new features
- Maintain existing test coverage
- Test across different build tools

## Pull Request Guidelines

1. Keep changes focused and atomic
2. Include tests for new features
3. Update documentation
4. Follow existing code style
5. Explain changes in PR description

## Release Process

1. Update version numbers
2. Update changelog
3. Build and test all packages
4. Create release PR
5. Tag release after merge

## Need Help?

- Open an issue for bugs
- Start a discussion for features
- Ask questions in GitHub Discussions

## Code of Conduct

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) when contributing to this project.