---
"@project-karin/redis": patch
"@project-karin/cli": patch
---

- **@project-karin/redis**: Export usage of `UpstashRedis` (aliased from `@upstash/redis`'s `Redis` class) to allow consumers to use the Upstash client directly.
- **@project-karin/cli**: Refactor internal `paths` utility to `PathUtils` static class to improve testability and fix unit tests for source directory detection.
