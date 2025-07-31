# Development Guide

## Prerequisites

- Node.js 18+
- pnpm

## Setup

```bash
pnpm install
```

## Running Locally

Start each module in a separate terminal:

```bash
cd mf_shell && pnpm dev
cd mf_cart && pnpm dev
cd mf_products && pnpm dev
cd mf_user && pnpm dev
# ...other modules
```

## Type Checking

```bash
pnpm typecheck
```

## Linting & Formatting

- Use ESLint and Prettier (add config if not present).

## Hot Reloading

- Supported via Rsbuild dev server.

## Adding a New Remote

1. Create a new module folder (e.g., `mf_newfeature`).
2. Add `module-federation.config.ts`.
3. Register the remote in the shell’s config.

## Styling: Module and Global Integration

Each module (e.g., `mf_cart`, `mf_shared_lib`) can have its own component-level styles, while also leveraging global Bootstrap utilities provided by `mf_shell`.

### Best Practices

- **Component Styles:**

  - Use CSS Modules (`Component.module.css`/`.scss`) or CSS-in-JS (e.g., styled-components) for local, isolated styles in each module.
  - This prevents style leakage and naming conflicts between modules.

- **Global Styles and Utilities:**

  - The `mf_shell` imports Bootstrap CSS globally (e.g., in `src/index.tsx` or `App.tsx`).
  - All modules and shared components can use Bootstrap utility classes (e.g., `d-flex`, `text-center`, `mb-3`) directly in their JSX.
  - Avoid redefining Bootstrap classes in local styles.

- **Shared Components:**

  - Components in `mf_shared_lib` should use local styles for their unique look, but can also use Bootstrap utility classes for layout, spacing, and responsiveness.
  - Document any required global classes in the component’s README or JSDoc.

- **Custom Themes:**
  - If you need to customize Bootstrap (e.g., colors, breakpoints), do so in the `mf_shell` and ensure the compiled CSS is available to all remotes.

### Example Usage

```tsx
// In mf_cart/src/components/CartItem.tsx
import styles from './CartItem.module.css';

export function CartItem() {
  return (
    <div className={`d-flex align-items-center ${styles.cartItem}`}>
      {' '}
      {/* Uses both Bootstrap and local styles */}
      {/* ... */}
    </div>
  );
}
```

### Tips

- Always scope custom styles locally unless they are meant to be global.
- Use Bootstrap utility classes for layout and spacing to ensure consistency across modules.
- If using CSS Modules, class names are automatically scoped, so you can safely use common names like `container` or `button`.
- For global overrides or theming, make changes in the `mf_shell` and document them for all module authors.

## Typings: Strategies for Sharing Types

Type sharing is crucial for consistency and type safety across modules. There are several strategies, each with its own trade-offs:

### 1. Import Typings via tsconfig Paths (Monorepo Only)

- Use `tsconfig.json` paths to directly import types from another module (e.g., `mf_cart` imports `Product` type from `mf_products`).
- **Example:**
  - In `mf_cart/tsconfig.json`:
    ```json
    {
      "compilerOptions": {
        "paths": {
          "@mf-products/*": ["../mf_products/src/*"]
        }
      }
    }
    ```
  - In code:
    ```ts
    import type {Product} from '@mf-products/types';
    ```
- **Pros:** No runtime dependency, no need to register as a remote, reduces build weight.
- **Cons:** Only works in a monorepo setup where source is available.

### 2. Generated Typings from Module Federation (`@mf-types` Folder)

- When using the `mf-manifest` method, typings can be generated and placed in a shared `@mf-types` folder.
- Works best when all modules use the same framework (e.g., React-to-React).
- **Usage:**
  - Import types from `@mf-types/remoteName/typeFile`.
  - Example: `import type { Product } from '@mf-types/mf_products/Product';`
- **Pros:** Centralized, works well with manifest-based federation.
- **Cons:** Only works for compatible frameworks and with manifest support.

### 3. Import Through Remote (Expose Type File via Module Federation)

- Expose type files as modules in the remote’s federation config.
- **Example:**
  - In `mf_products/module-federation.config.ts`:
    ```js
    exposes: {
      './ProductTypes': './src/types/Product.ts',
    }
    ```
  - In consuming module:
    ```ts
    const ProductTypes = await import('mf_products/ProductTypes');
    // Use types from ProductTypes
    ```
- **Pros:** Works in both monorepo and polyrepo, no need for direct file access.
- **Cons:** Types are loaded at runtime, not compile time; requires extra build tooling for type extraction.

## Adding a Redux Slice and Saga to a New Module

To add a new Redux slice and saga to a module (e.g., `mf_cart`), follow these steps:

1. **Create the slice and saga:**
   - Define your slice in `src/redux/yourSlice.ts` using `createSlice` from Redux Toolkit.
   - Define your saga in `src/redux/yourSaga.ts`.
2. **Inject the slice and saga in `src/bootstrap.ts`:**
   - Use your module's inject method (e.g., `injectReducer`, `injectSaga`) to dynamically add the slice and saga when the module loads.

**Example (`mf_cart/src/bootstrap.ts`):**

```ts
import {injectReducer, injectSaga} from './redux/store';
import yourSlice from './redux/yourSlice';
import yourSaga from './redux/yourSaga';

// Inject the reducer
injectReducer('yourSlice', yourSlice.reducer);

// Inject the saga
injectSaga('yourSaga', yourSaga);
```

3. **Use the slice in your components:**
   - Use `useSelector` and `useDispatch` from `react-redux` to interact with your slice in React components.

**Benefits:**

- Enables code splitting and on-demand loading of state logic.
- Keeps module state isolated and maintainable.

**Note:**

- The actual inject methods may vary depending on your store setup. Refer to your module’s `redux/store.ts` for the correct usage.
