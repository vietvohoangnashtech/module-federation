# Architecture

## Overview

This monorepo implements a micro-frontend architecture using Module Federation. The environment consists of several independently developed and deployed modules:

- `mf_shell` (host/shell)
- `mf_cart` (remote)
- `mf_products` (remote)
- `mf_user` (remote)
- `mf_shared_lib` (shared library)

The `mf_shell` app acts as the host, dynamically loading remote modules at runtime. Each remote can be developed, tested, and deployed independently, enabling scalable and flexible frontend development.

## Diagram

```
[mf_shell] <---> [mf_cart]
         \-----> [mf_products]
         \-----> [mf_user]
         \-----> [mf_shared_lib]
```

## Key Concepts

- **Host (Shell):** Loads and orchestrates remote modules.
- **Remotes:** Independently developed and deployed micro-frontends.
- **Shared Libraries:** Common dependencies (React, Redux, etc.) are shared to avoid duplication.

## Technology Stack

- React 18
- TypeScript
- Rsbuild
- Module Federation
- Redux Toolkit (peer dependency)
- Redux Saga (peer dependency)

## Monorepo Structure

- `mf_shell/` – Host application
- `mf_cart/` – Cart micro-frontend
- `mf_products/` – Products micro-frontend
- `mf_user/` – User micro-frontend
- `mf_shared_lib/` – Shared UI and logic
- `docs/` – Documentation
- `package.json`, `pnpm-workspace.yaml` – Monorepo management

## Migrating to Polyrepo

If you want to migrate from a monorepo to a polyrepo setup:

1. Create a new repository for each module (`mf_shell`, `mf_cart`, etc.).
2. Move the code for each module into its own repo, preserving the structure.
3. Update remote URLs in each `module-federation.config.ts` to point to the deployed locations or dev servers of the new repos.
4. Set up CI/CD for each repo independently.
5. Use a shared npm package or git submodule for `mf_shared_lib` if needed.
6. Update documentation and onboarding instructions for each repo.
7. **Typings Strategy:**
   - Publish shared types as a versioned npm package (recommended for polyrepo).
   - Use API-exposed types via module federation (see above).
   - For generated typings, publish the `@mf-types` folder as a package or distribute via a private registry.
   - Document the chosen approach for all teams.

**Benefits:**

- Independent versioning and deployment
- Smaller, focused codebases
- Team autonomy

**Considerations:**

- More complex dependency management
- Coordination for shared changes
- Need robust type sharing and versioning
