---
"@project-karin/drizzle": patch
"@project-karin/redis": patch
"@project-karin/core": patch
---

- **@project-karin/drizzle**: Added `DrizzleExceptionFilter` to handle database errors (e.g., duplicate keys as 409 Conflict, foreign key violations as 400 Bad Request).
- **@project-karin/redis**: Added `RedisExceptionFilter` to handle connection errors (503 Service Unavailable) and timeouts (504 Gateway Timeout) for both IoRedis and Upstash adapters.
- **@project-karin/core**: Fixed unused arguments in decorators (`Fast`, `Get`, `Post`, etc.) to improve code quality and avoid linter warnings.
