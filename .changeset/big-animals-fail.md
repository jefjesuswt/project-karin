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

Fixed build target to use `"browser"` instead of `"node"` for universal runtime compatibility. This ensures packages work correctly in Cloudflare Workers, Deno, Node.js, and other edge runtimes by avoiding Node.js-specific APIs like `createRequire`.
