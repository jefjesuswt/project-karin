---
"@project-karin/auth": patch
---

feat: allow lazy evaluation for JWT secret

Updated `JwtModuleOptions` to accept `secret` as `string | (() => string)`. This allows for lazy evaluation of the secret, which is particularly useful when using `ConfigPlugin` to load environment variables that might not be available at the time of module definition (e.g., in Cloudflare Workers).
