---
"@project-karin/platform-hono": patch
"@project-karin/platform-h3": patch
"@project-karin/mongoose": patch
"@project-karin/drizzle": patch
"@project-karin/openapi": patch
"@project-karin/config": patch
"@project-karin/redis": patch
"@project-karin/core": patch
"@project-karin/auth": patch
"@project-karin/cli": patch
---

feat: universal serverless support & full SQL adapters

- **Core**: Added `KarinFactory.serverless()` for universal environment hydration.
- **Drizzle**: Added `PostgresAdapter`, `MysqlAdapter`, and `NeonAdapter`.
- **Redis**: Refactored to use Adapter pattern.
- **CLI**: Renamed project to "Karin" and improved templates.
