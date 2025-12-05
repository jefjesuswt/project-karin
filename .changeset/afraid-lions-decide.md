---
"@project-karin/config": patch
"@project-karin/redis": patch
---

fix: improve compatibility with edge runtimes (Cloudflare Workers)

- **@project-karin/config**:
  - Made `fs` and `path` imports conditional and lazy-loaded.
  - Fixed `ConfigPlugin` to work in environments where Node.js APIs are not available.
  - Added support for explicit environment variables passing via `options.env` or global `env` object.

- **@project-karin/redis**:
  - Moved client registration from `onPluginInit` to `install` method.
  - This ensures the Redis client is available for dependency injection during controller instantiation, fixing issues in serverless environments where lazy initialization caused injection errors.
