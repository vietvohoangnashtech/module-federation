# Architecture Overview

## 1. `mf_lib`

- **Type:** Shared Library
- **Tech Stack:** React 18, Rslib
- **Purpose:** Provides shared components and types for other apps.
- **Module Federation:** Exposes components for consumption by other apps.
- **Structure:**
  - `src/`: Contains shared React components.
  - `@mf-types/`: Type definitions for federation consumers.
  - `module-federation.config.ts`: Federation configuration.

---

## 2. `mf_react_rsbuild`

- **Type:** Consumer App
- **Tech Stack:** React 18, Rsbuild
- **Purpose:** Demonstrates consuming federated modules from `mf_lib`.
- **Module Federation:** Uses Rsbuild's federation plugin to import remote components.
- **Structure:**
  - `src/`: Main app and routes.
  - `@mf-types/`: Type definitions for imported modules.
  - `module-federation.config.ts`: Federation configuration.

---

## 3. `mf_provider_app`

- **Type:** Provider App
- **Tech Stack:** React 18, Rsbuild
- **Purpose:** Provides federated modules for consumption by other apps.
- **Module Federation:** Exposes components for federation; acts as a remote provider.
- **Structure:**
  - `src/`: Provider components and bootstrap logic.
  - `@mf-types/`: Type definitions for exposed modules.
  - `module-federation.config.ts`: Federation configuration.

---

## 4. `mf_react_vite`

- **Type:** Consumer App (Imported from Existing Project)
- **Tech Stack:** React 18, Vite 7
- **Purpose:** Demonstrates consuming federated modules using Vite.
- **Module Federation:** Typing support is limited; consumes remote components from `mf_lib`.
- **Structure:**
  - `src/`: Main app and assets.
  - `@types/`: Type definitions for federated modules.
  - `vite.config.ts`: Vite and federation configuration.

---

## 5. `mf_react_webpack`

- **Type:** Consumer App (Imported from Existing Project)
- **Tech Stack:** React 18, Webpack 5
- **Purpose:** Demonstrates consuming federated modules using Webpack.
- **Module Federation:** Requires direct React.Lazy import of remote components; cannot import from `mf_lib` index.tsx directly.
- **Structure:**
  - `src/`: Main app and test files.
  - `@mf-types/`: Type definitions for federated modules.
  - `webpack.config.cjs`: Webpack and federation configuration.

---

## Monorepo Solution

- **Tooling:** Managed with pnpm workspace for dependency sharing and development convenience.
- **Goal:** Transition to a polyrepo solution for broader framework compatibility.

---

## Key Notes

- Webpack requires explicit component exposure for federation.
- Vite federation typing is not fully supported yet.
