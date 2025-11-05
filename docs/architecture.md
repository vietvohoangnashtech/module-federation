# Architecture Overview

## Core Components

### 1. Module Federation CLI (`mfe_cli`)

- **Type:** Development Tool
- **Tech Stack:** Node.js, TypeScript
- **Purpose:** Scaffolds new micro-frontend applications with predefined templates
- **Key Features:**
  - Multiple template support (Webpack, Vite, RSBuild)
  - Automatic Module Federation configuration
  - Workspace and standalone operation modes
- **Structure:**
  - `src/`: CLI source code and template handlers
  - `templates/`: Base templates for different frameworks
  - `prepare-publish.ts`: Template packaging for global use

### 2. Shared Component Library (`mf_lib`)

- **Type:** Shared Library
- **Tech Stack:** React 18, RSBuild
- **Purpose:** Provides reusable components and types
- **Module Federation:**
  - Exposes components for consumption by remotes
  - Handles shared dependency versioning
- **Structure:**
  - `src/components/`: Shared React components
  - `@mf-types/`: Type definitions for consumers
  - `module-federation.config.ts`: Federation setup
  - `rslib.config.ts`: Build configuration

### 3. Host Application (`mf_provider_app`)

- **Type:** Host/Shell Application
- **Tech Stack:** React 18, RSBuild
- **Purpose:** Primary application that loads remote modules
- **Module Federation:**
  - Manages remote loading and initialization
  - Handles shared dependency orchestration
- **Structure:**
  - `src/`: Host components and routing
  - `module-federation.config.ts`: Remote declarations

## Remote Applications

### 1. RSBuild Remote (`mf_react_rsbuild`)

- **Type:** Remote MFE
- **Tech Stack:** React 18, RSBuild
- **Features:**
  - Modern build configuration
  - Optimized performance
  - TypeScript support
- **Module Federation:**
  - Uses RSBuild's federation plugin
  - Seamless TypeScript integration

### 2. Vite Remote (`mf_react_vite`)

- **Type:** Remote MFE
- **Tech Stack:** React 18, Vite 7
- **Features:**
  - Fast development server
  - CSS modules support
  - Jest testing setup
- **Module Federation:**
  - Limited TypeScript support
  - Uses @originjs/vite-plugin-federation

### 3. Webpack Remote (`mf_react_webpack`)

- **Type:** Remote MFE
- **Tech Stack:** React 18, Webpack 5
- **Features:**
  - Traditional Webpack setup
  - Full Module Federation support
  - SCSS and asset handling
- **Module Federation:**
  - Native Webpack 5 federation
  - Explicit component exposure

## Build Tool Integration

### RSBuild

- **Purpose:** Modern, performance-focused bundler
- **Benefits:**
  - Fast build times
  - Built-in optimizations
  - TypeScript-first approach
- **Module Federation:**
  - Native federation plugin
  - Automatic type generation

### Vite

- **Purpose:** Next-generation frontend tooling
- **Benefits:**
  - Lightning-fast HMR
  - ES modules native approach
  - Minimal configuration
- **Module Federation:**
  - Plugin-based federation support
  - Development-time optimizations

### Webpack

- **Purpose:** Traditional, battle-tested bundler
- **Benefits:**
  - Mature ecosystem
  - Extensive plugin system
  - Deep customization
- **Module Federation:**
  - Native Module Federation support
  - Reference implementation

## Monorepo Architecture

- **Package Management:** pnpm workspaces
- **Benefits:**
  - Shared dependencies
  - Consistent versioning
  - Development convenience
- **Structure:**
  - Root workspace configuration
  - Package-specific setups
  - Shared TypeScript configs

## Type System

- **Approach:** TypeScript throughout
- **Features:**
  - Shared type definitions
  - Module Federation typing
  - Build-time type checking
- **Challenges:**
  - Vite federation typing limitations
  - Cross-remote type sharing
  - Dynamic import typing

## Development Workflow

1. **Template Creation:**
   - CLI generates new MFE
   - Configures build tool
   - Sets up Module Federation

2. **Component Development:**
   - Build in shared library
   - Export via federation
   - Import in remotes

3. **Integration:**
   - Host loads remotes
   - Handles versioning
   - Manages dependencies

## Future Considerations

1. **Polyrepo Migration:**
   - Template standardization
   - Dependency management
   - CI/CD integration

2. **Framework Support:**
   - Angular integration
   - Vue.js templates
   - Svelte compatibility

3. **Build Tool Evolution:**
   - RSBuild optimization
   - Vite federation improvements
   - Webpack modernization
