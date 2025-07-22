# E-commerce Application: Module Federation Architecture

This document outlines the technical architecture for a modern e-commerce application built using a Micro-Frontends (MFE) approach with Module Federation. The primary goal is to create a scalable, maintainable, and independently deployable system.

## 1. Core Architectural Strategy

The application will be decomposed into several independent domains, each managed by a dedicated micro-frontend application. These applications will be developed and deployed independently but will come together at runtime in a single, cohesive user experience.

We will use a **monorepo** (managed by pnpm workspaces, as is currently set up) to manage all micro-frontend applications and shared libraries. This simplifies dependency management and ensures consistency.

The core technology stack for all frontends will be **React, TypeScript, and Redux with Redux-Saga** for state management.

## 2. Proposed Micro-Frontend Modules

The e-commerce platform will be composed of the following modules:

| Module Name         | Description                                                                                             | New/Existing |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ------------ |
| `mf_shell`          | The main application container (or "host"). Renders the global layout and orchestrates other MFEs.        | New          |
| `mf_products`       | Handles product discovery, including listing, search, and product detail pages.                         | New          |
| `mf_cart`           | Manages the shopping cart state and UI.                                                                 | New          |
| `mf_checkout`       | A self-contained module for the entire checkout process.                                                | New          |
| `mf_user`           | Manages user authentication, registration, and account pages (e.g., order history).                     | New          |
| `mf_shared_lib`     | A shared library of common, stateless UI components and utility functions.                              | Replaces `mf_lib` |

---

## 3. Module-by-Module Design

### a. `mf_shell` (The Host Application)

*   **Responsibilities:**
    *   Render the main application frame: Header, Footer, and the primary content area.
    *   Manage top-level browser routing (e.g., `/`, `/products/:id`, `/cart`).
    *   Dynamically load and mount the appropriate micro-frontend into the content area based on the current route.
    *   Host globally visible components exposed by other MFEs, such as the `MiniCart` from `mf_cart` and `AuthStatus` from `mf_user`.
*   **Exposes:** Nothing. It is the container.
*   **Consumes:**
    *   `mf_products`: For the product list and detail pages.
    *   `mf_cart`: For the main cart page and the `MiniCart` component in the header.
    *   `mf_checkout`: For the checkout flow.
    *   `mf_user`: For login/account pages and the `AuthStatus` component.
    *   `mf_shared_lib`: For any foundational layout components.

### b. `mf_products`

*   **Responsibilities:**
    *   Fetch and display lists of products (Product Listing Page).
    *   Implement search and filtering functionality.
    *   Fetch and display the details for a single product (Product Detail Page).
    *   Manage its own internal state (e.g., product list, search query) using its own Redux store.
*   **Exposes (via Module Federation):**
    *   `./ProductListPage`: The component for browsing all products.
    *   `./ProductDetailPage`: The component for viewing a single product.
*   **Consumes:**
    *   `mf_shared_lib`: For UI elements like `Button`, `Card`, `Spinner`.

### c. `mf_cart`

*   **Responsibilities:**
    *   Manage all aspects of the shopping cart state (add, remove, update quantity).
    *   Persist cart state (e.g., to `localStorage`).
    *   Provide the full-page view of the shopping cart.
*   **Exposes:**
    *   `./CartPage`: The main component for the `/cart` route.
    *   `./MiniCart`: A small component to be displayed in the shell's header, showing the item count.
*   **Consumes:**
    *   `mf_shared_lib`: For UI elements.

### d. `mf_checkout`

*   **Responsibilities:**
    *   Handle the entire multi-step checkout process (shipping address, payment method, order review).
    *   This module is designed as a self-contained funnel to minimize distractions and dependencies.
*   **Exposes:**
    *   `./CheckoutFlow`: The main component that orchestrates the checkout steps.
*   **Consumes:**
    *   `mf_shared_lib`: For UI elements like `Input`, `Button`, `Modal`.

### e. `mf_user`

*   **Responsibilities:**
    *   Handle user login, logout, and registration.
    *   Manage user session/authentication state.
    *   Display user account information, including order history.
*   **Exposes:**
    *   `./LoginPage`: The component for the `/login` route.
    *   `./AccountPage`: The component for the `/account` route.
    *   `./AuthStatus`: A small component for the shell's header to show login/logout status.
*   **Consumes:**
    *   `mf_shared_lib`: For UI elements.

### f. `mf_shared_lib`

*   **Responsibilities:**
    *   Provide a library of stateless, reusable UI components (e.g., `Button`, `Input`, `Modal`, `Spinner`).
    *   Provide shared utility functions (e.g., `formatCurrency`, `apiClient`).
    *   Define and export shared TypeScript types and interfaces to ensure consistency.
*   **Exposes:**
    *   `./Button`, `./Input`, etc.
    *   `./utils`
    *   `./types`
*   **Consumes:** Nothing.

---

## 4. Data Flow and Inter-Module Communication

To maintain decoupling, modules will not directly access each other's Redux stores. Instead, communication will be handled via two primary patterns:

1.  **Routing (Top-Down):** The `mf_shell` controls which MFE is active based on the URL. It passes route parameters (like a product ID) as props to the mounted MFE.
2.  **Browser Events (Bottom-Up):** When an action in one MFE needs to trigger a state change in another, it will dispatch a `CustomEvent`. Other MFEs will listen for these events. This is the primary method for cross-module interaction.

**Example Flow: Adding an item to the cart**

1.  **User Action:** The user is on the `ProductDetailPage` (rendered by `mf_products`) and clicks the "Add to Cart" button.
2.  **Event Dispatch:** The `mf_products` module does **not** know about the cart's internal logic. It simply dispatches a browser event:
    ```javascript
    // Inside mf_products component
    const product = { id: '123', name: 'Gaming Mouse', price: 59.99 };
    const event = new CustomEvent('addToCart', { detail: { product } });
    window.dispatchEvent(event);
    ```
3.  **Event Listening:** The `mf_cart` module, loaded in the background by the shell, listens for this specific event.
    ```javascript
    // Inside mf_cart logic
    window.addEventListener('addToCart', (event) => {
      const { product } = event.detail;
      // Dispatch a Redux action to add the product to its own internal store.
      dispatch(cartActions.addItem(product));
    });
    ```
4.  **State Update:** The `mf_cart` Redux store is updated. The `MiniCart` component (displayed in the shell) re-renders automatically to show the new item count.

---

## 5. CI/CD and Deployment Strategy

The architecture is designed for independent deployments, which is a core strength of micro-frontends.

1.  **Infrastructure:** Each micro-frontend (including the shell) will be deployed as a separate static application to a CDN/object store (e.g., AWS S3, Vercel, Netlify).

2.  **Versioning:** Each deployment will be versioned to ensure stability. A deployment of `mf_products` will be uploaded to a path like `https://cdn.my-app.com/mf_products/1.5.2/`. This immutability prevents a bad deployment from breaking existing, stable versions. A `latest` tag can also be maintained.

3.  **CI/CD Pipeline:**
    *   **Trigger:** The pipeline is triggered on a push or merge to the `main` branch.
    *   **Step 1: Detect Changes:** The pipeline will first determine which modules have been changed compared to the last successful deployment. This can be done with tools like `pnpm --filter` or Nx.
    *   **Step 2: Build, Lint, Test:** For each changed module, the pipeline will run the `build`, `lint`, and `test` scripts. The process stops if any step fails.
    *   **Step 3: Version & Deploy:**
        *   If tests pass, the module's `package.json` version is bumped.
        *   The build output is uploaded to the CDN under its new versioned path (e.g., `/mf_products/1.5.3/`).
    *   **Step 4: Update Host:** The `mf_shell`'s Module Federation configuration points to the URLs of the remote modules. To roll out a new version of a micro-frontend to production, the shell's configuration is updated with the new versioned URL, and the shell itself is re-deployed. This gives us ultimate control over what version of each MFE is live in production.