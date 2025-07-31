# Architecture

## Overview

This monorepo implements a micro-frontend architecture using Module Federation. The `mf_shell` app acts as the host, dynamically loading remote modules at runtime.

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
