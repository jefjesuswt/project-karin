---
"@project-karin/platform-hono": minor
"@project-karin/platform-h3": minor
"@project-karin/mongoose": minor
"@project-karin/drizzle": minor
"@project-karin/openapi": minor
"@project-karin/config": minor
"@project-karin/redis": minor
"@project-karin/core": minor
"@project-karin/auth": minor
"@project-karin/cli": minor
---

feat: universal serverless support & full SQL adapters

- **Core**: Added `KarinFactory.serverless()` for universal environment hydration.
- **Drizzle**: Added `PostgresAdapter`, `MysqlAdapter`, and `NeonAdapter`.
- **Redis**: Refactored to use Adapter pattern.
- **CLI**: Renamed project to "Karin" and improved templates.
