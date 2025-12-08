# @project-karin/auth

## 0.5.14

## 0.5.13

## 0.5.12

### Patch Changes

- cd28ce3: feat: allow lazy evaluation for JWT secret

  Updated `JwtModuleOptions` to accept `secret` as `string | (() => string)`. This allows for lazy evaluation of the secret, which is particularly useful when using `ConfigPlugin` to load environment variables that might not be available at the time of module definition (e.g., in Cloudflare Workers).

## 0.5.11

## 0.5.10

## 0.5.9

## 0.5.8

### Patch Changes

- 4703df5: Fixed build target to use `"browser"` instead of `"node"` for universal runtime compatibility. This ensures packages work correctly in Cloudflare Workers, Deno, Node.js, and other edge runtimes by avoiding Node.js-specific APIs like `createRequire`.

## 0.5.7

### Patch Changes

- 2a8142d: **Critical Fix**: Resolved broken imports in published packages

  Fixed a critical issue where published packages had broken imports to `./src/` files that didn't exist in the npm package. The build system was using `external: ["*"]` which prevented Bun from bundling internal imports, causing runtime errors in all consuming projects.

  **Changes:**

  - Updated build script to properly bundle internal imports while keeping external dependencies separate
  - Changed `target` from `"bun"` to `"node"` for better compatibility across runtimes
  - Changed `external` from `["*"]` to actual package dependencies array
  - All packages now bundle correctly with no broken relative imports

  **Impact:**

  - ✅ Fixes "Could not resolve ./src/..." errors in Cloudflare Workers, Deno, Node.js, and Bun
  - ✅ Improves compatibility with all JavaScript runtimes
  - ✅ Reduces bundle size by eliminating unnecessary file structure
  - ✅ Maintains compatibility with ESM module resolution

  This fix is essential for all users of `@project-karin` packages and resolves the issues preventing projects from running in serverless/edge environments.

## 0.5.6

## 0.5.5

### Patch Changes

- 8ee7432: feat: universal serverless support & full SQL adapters

  - **Core**: Added `KarinFactory.serverless()` for universal environment hydration.
  - **Drizzle**: Added `PostgresAdapter`, `MysqlAdapter`, and `NeonAdapter`.
  - **Redis**: Refactored to use Adapter pattern.
  - **CLI**: Renamed project to "Karin" and improved templates.

## 0.5.4

### Patch Changes

- @project-karin/core@0.5.4

## 0.5.3

### Patch Changes

- 60c503e: adpters on redis package
- Updated dependencies [60c503e]
  - @project-karin/core@0.5.3

## 0.5.2

### Patch Changes

- 5c76655: Fix: Replace workspace protocol with explicit versions to resolve installation issues in consuming projects.
- Updated dependencies [5c76655]
  - @project-karin/core@0.5.2

## 0.5.1

### Patch Changes

- 51c73d4: Fix: Update CLI to migrate legacy package names and resolve publishing conflicts.
- Updated dependencies [51c73d4]
  - @project-karin/core@0.5.1
