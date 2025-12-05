---
"@project-karin/auth": patch
"@project-karin/cli": patch
"@project-karin/config": patch
"@project-karin/core": patch
"@project-karin/drizzle": patch
"@project-karin/mongoose": patch
"@project-karin/openapi": patch
"@project-karin/platform-h3": patch
"@project-karin/platform-hono": patch
"@project-karin/redis": patch
---

**Critical Fix**: Resolved broken imports in published packages

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
