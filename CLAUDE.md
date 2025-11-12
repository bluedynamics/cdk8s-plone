# Claude Code Project Guide

This document provides context and guidelines for Claude Code when working on this project.

## Project Overview

**cdk8s-plone** is a TypeScript/Python library for deploying Plone CMS to Kubernetes using CDK8S constructs. It provides type-safe infrastructure as code with support for Volto (React frontend) and Classic UI deployments.

## Git Workflow

**IMPORTANT: Never merge directly to `main`**

This project uses a Pull Request workflow:

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/description
   # or
   git checkout -b docs/description
   # or
   git checkout -b fix/description
   ```

2. **Make commits** on the feature branch with descriptive messages

3. **Create a Pull Request** to merge into `main`:
   - Use GitHub UI or `gh` CLI
   - PRs are required for code review
   - Never push directly to `main`
   - Never merge locally to `main`

4. **PR will be reviewed and merged** by maintainers

### Branch Naming Conventions

- `feat/` or `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `chore/` - Maintenance tasks
- `refactor/` - Code refactoring
- `test/` - Test additions or changes

## Project Structure

```
.
├── src/               # TypeScript source code
│   ├── plone.ts      # Main Plone construct
│   ├── service.ts    # Service utilities
│   └── ...
├── test/             # Jest tests
├── documentation/    # Sphinx documentation (Diataxis framework)
│   ├── sources/      # Documentation source files
│   ├── Makefile      # Build automation (mxmake)
│   └── README.md     # Documentation contributor guide
├── .projenrc.ts      # Projen project configuration
├── API.md            # Auto-generated API documentation
└── README.md         # Main project README
```

## Build System

This project uses **Projen** for project management.

**⚠️ DO NOT edit generated files directly**

Generated files include:
- `package.json`
- `tsconfig.json`
- `.gitignore`
- GitHub Actions workflows (except custom ones)
- And more...

### Making Changes

1. **Edit `.projenrc.ts`** for project configuration changes
2. **Run `npx projen`** to regenerate files
3. **Make code changes** in `src/`
4. **Run tests**: `npx projen test`
5. **Update snapshots if needed**: `npx projen test -- -u`

### Common Commands

```bash
# Install dependencies
npm install

# Run tests
npx projen test

# Run tests in watch mode
npx projen test:watch

# Build (compile + generate bindings)
npx projen build

# Lint
npx projen eslint

# Generate API docs
npx projen docgen

# Package for distribution
npx projen package-all

# Update project files after .projenrc.ts changes
npx projen
```

## Documentation

Documentation uses **Sphinx** with the **Diataxis framework**:

- **Tutorials**: Learning-oriented, step-by-step guides
- **How-To Guides**: Goal-oriented, problem-solving recipes
- **Reference**: Information-oriented, technical specifications
- **Explanation**: Understanding-oriented, concepts and design

### Building Documentation

```bash
cd documentation

# Build HTML
make docs

# Live-reload development server
make docs-live

# Clean and rebuild
make clean && make docs
```

### Documentation Deployment

- Documentation auto-deploys to GitHub Pages on push to `main`
- Workflow: `.github/workflows/documentation.yml`
- Published at: `https://bluedynamics.github.io/cdk8s-plone/`

## Testing

- **Framework**: Jest
- **Test location**: `test/` directory
- **Snapshots**: Used for testing generated Kubernetes manifests
- **Update snapshots**: `npx projen test -- -u`

## Multi-Language Support

The library is published in multiple languages via JSII:

- **TypeScript/JavaScript**: `@bluedynamics/cdk8s-plone` on npm
- **Python**: `cdk8s-plone` on PyPI

JSII configuration is in `package.json` under the `jsii` field.

## Code Style

- **Linter**: ESLint with TypeScript support
- **Style**: Configured via `.projenrc.ts`
- **Run linter**: `npx projen eslint`

## Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `ci`: CI/CD changes

**Example:**
```
feat(plone): add support for custom environment variables

Allow passing custom environment variables to backend and frontend
containers using the cdk8s-plus-30 Env API.

Closes #123
```

All commits from Claude Code include:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## CI/CD

GitHub Actions workflows:

- **build.yml**: Build, test, and package
- **release.yml**: Create releases and publish to npm/PyPI
- **upgrade-main.yml**: Dependency upgrades
- **pull-request-lint.yml**: PR validation
- **documentation.yml**: Build and deploy docs to GitHub Pages

## Dependencies

### Runtime Dependencies

- `cdk8s` - CDK8S framework
- `cdk8s-plus-30` - CDK8S plus constructs
- `constructs` - Construct base classes

### Development Dependencies

- `projen` - Project management
- `jsii` - Multi-language support
- `jest` - Testing
- `typescript` - Language
- `eslint` - Linting

## Publishing

**Do not manually publish packages**

Publishing is automated via GitHub Actions on release:
1. Create and push a git tag (via `npx projen release`)
2. GitHub Actions builds and publishes to npm and PyPI
3. Release notes are auto-generated

## Important Notes

- **Never merge to main**: Always create PRs
- **Don't edit generated files**: Use `.projenrc.ts` and run `npx projen`
- **Update snapshots after changes**: Run `npx projen test -- -u`
- **Follow Diataxis**: When adding docs, use the correct category
- **Documentation builds required**: Run `make docs` to verify doc changes

## Resources

- [CDK8S Documentation](https://cdk8s.io/)
- [Projen Documentation](https://projen.io/)
- [Diataxis Framework](https://diataxis.fr/)
- [JSII Documentation](https://aws.github.io/jsii/)
- [Example Project](https://github.com/bluedynamics/cdk8s-plone-example)

## Maintainer Contact

**Author:** Jens W. Klein (jk@kleinundpartner.at)
**Organization:** [Blue Dynamics Alliance](https://github.com/bluedynamics)
