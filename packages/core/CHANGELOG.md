# @project-karin/core

## 0.5.14

### Patch Changes

- fe1464c: feat: add `providers` option to `KarinFactory` for manual instantiation of classes (services, strategies) at startup.

## 0.5.13

### Patch Changes

- a10a777: feat: export `SetMetadata` decorator to allow creating custom decorators

## 0.5.12

## 0.5.11

### Patch Changes

- 6c40dab: fix: support explicit DTO passing in param decorators for environments without metadata reflection (e.g. Cloudflare Workers)

  - Updated `@Body`, `@Query`, `@Param`, etc. to accept an optional DTO class argument.
  - This allows validation pipes to work correctly in environments where `emitDecoratorMetadata` is not supported or stripped by bundlers like `esbuild`.
  - Example: `@Body(CreateUserDto) body: CreateUserDto`

## 0.5.10

### Patch Changes

- 0a80f35: Fix ZodValidationPipe to correctly receive metatype for @ZodDto validation and update documentation.

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

### Patch Changes

- adb9948: ## Build System & Deno Compatibility

  ### Core Package

  - **Bundled Build**: Changed build system from `tsc` only to `Bun.build` + `tsc --emitDeclarationOnly`
    - Now generates a single bundled `dist/index.js` file for better compatibility
    - Resolves all internal imports, making packages compatible with Deno and other runtimes
    - Fixes `ERR_UNSUPPORTED_DIR_IMPORT` errors in Deno

  ### Platform H3

  - **Deno Support**: Fixed `fetch` method binding in `H3Adapter` to work correctly with Deno Deploy
  - **Template Updates**: Updated H3 templates (Deno & Cloudflare) to use manual controller registration instead of file scanning

  ### Templates

  - **Added to Repository**: All templates now live in `/templates` folder in the main repo
    - `hono-bun`, `hono-cloudflare`, `hono-deno`
    - `h3-bun`, `h3-cloudflare`, `h3-deno`
  - **Deno Deploy Ready**: Templates for Deno now properly export handlers for `deno serve` command
  - **Removed Manual Deno.serve**: Templates rely on `export default handler` for cleaner Deno Deploy integration

  ## CLI Improvements

  ### Template Management

  - **GitHub Integration**: CLI now downloads templates from `github:jefjesuswt/project-karin/templates/{template-name}`
  - **No Separate Repos**: Templates are part of the main monorepo, downloaded via `giget`

  ### Generator Enhancements

  - **Database-Agnostic Entities**: Entity generator now creates TypeScript interfaces instead of Mongoose-specific classes
    - Includes examples for Drizzle, Mongoose, Prisma, and TypeORM
    - Works with any ORM/database solution
  - **Type Aliases**: Added support for command abbreviations:
    - `co`, `c` → controller
    - `s`, `srv` → service
    - `e`, `ent` → entity
    - `g` → guard
    - `f` → filter
    - `r`, `res` → resource
    - `p` → plugin
    - `d`, `dec` → decorator

  ### Examples

  ```bash
  # Now you can use short aliases
  karin g co users    # Generate controller
  karin g s auth      # Generate service
  karin g e product   # Generate entity
  karin g r posts     # Generate resource
  ```

## 0.5.5

### Patch Changes

- 8ee7432: feat: universal serverless support & full SQL adapters

  - **Core**: Added `KarinFactory.serverless()` for universal environment hydration.
  - **Drizzle**: Added `PostgresAdapter`, `MysqlAdapter`, and `NeonAdapter`.
  - **Redis**: Refactored to use Adapter pattern.
  - **CLI**: Renamed project to "Karin" and improved templates.

## 0.5.4

## 0.5.3

### Patch Changes

- 60c503e: adpters on redis package

## 0.5.2

### Patch Changes

- 5c76655: Fix: Replace workspace protocol with explicit versions to resolve installation issues in consuming projects.

## 0.5.1

### Patch Changes

- 51c73d4: Fix: Update CLI to migrate legacy package names and resolve publishing conflicts.
