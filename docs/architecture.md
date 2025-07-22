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

To maintain decoupling, modules will primarily communicate via routing and shared Redux store mechanisms.

1.  **Routing (Top-Down):** The `mf_shell` controls which MFE is active based on the URL. It passes route parameters (like a product ID) as props to the mounted MFE.
2.  **Shared Redux Store (Centralized State Management):** For global state management, a single Redux store is provided by `mf_shared_lib`. Remote applications (`mf_user`, `mf_products`, `mf_cart`, `mf_checkout`) can expose their specific reducers and sagas via Module Federation. The `mf_shell` (host) is responsible for dynamically injecting these reducers into the shared store and running the corresponding sagas. This ensures a unified state tree across the application while allowing individual MFEs to manage their domain-specific logic.

**Example Flow: User Login**

1.  **User Action:** The user interacts with the `LoginPage` component (exposed by `mf_user` and rendered by `mf_shell`).
2.  **Action Dispatch:** The `LoginPage` dispatches a Redux action (e.g., `loginRequest`) to the shared store.
3.  **Saga Execution:** The `mf_user`'s `authSaga` (which was dynamically run by `mf_shell` at startup) intercepts the `loginRequest` action.
4.  **API Call:** The `authSaga` makes an asynchronous call to the authentication API (e.g., Supabase).
5.  **State Update:** Based on the API response, the `authSaga` dispatches `loginSuccess` or `loginFailure` actions.
6.  **Reducer Update:** The `mf_user`'s `authReducer` (which was dynamically injected into the shared store by `mf_shell`) processes these actions and updates the relevant slice of the global Redux state.
7.  **UI Re-render:** Components subscribed to the authentication state in the shared store (e.g., `AuthStatus` in `mf_shell`) re-render to reflect the new login status.

---

## 5. Implementation Checklist

This section tracks the progress of implementing the micro-frontend modules and their core functionalities.

### Core Features

*   [x] **Login Flow (`mf_user` & `mf_shell` integration)**: User authentication, Redux store integration, and saga execution.
*   [ ] **Signup Flow (`mf_user` & `mf_shell` integration)**: User registration.
*   [ ] **Product Listing (`mf_products` & `mf_shell` integration)**: Displaying products, search, and filtering.
*   [ ] **Product Detail (`mf_products` & `mf_shell` integration)**: Displaying individual product details.
*   [ ] **Add to Cart (`mf_cart` & `mf_products` integration)**: Adding items to the shopping cart.
*   [ ] **Cart Page (`mf_cart` & `mf_shell` integration)**: Displaying and managing cart contents.
*   [ ] **Checkout Flow (`mf_checkout` & `mf_shell` integration)**: Multi-step checkout process.
*   [ ] **User Account Management (`mf_user` & `mf_shell` integration)**: Displaying user profile and order history.

### Shared Components & Utilities

*   [ ] **Shared UI Components (`mf_shared_lib`)**: Implement common UI components (e.g., Button, Input, Modal).
*   [ ] **Shared Redux Setup (`mf_shared_lib`)**: Ensure robust shared Redux store and saga middleware setup.
*   [ ] **API Client (`mf_shared_lib`)**: Centralized API client for consistent network requests.

---

## 6. CI/CD and Deployment Strategy

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