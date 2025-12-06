---
"@project-karin/core": patch
---

fix: support explicit DTO passing in param decorators for environments without metadata reflection (e.g. Cloudflare Workers)

- Updated `@Body`, `@Query`, `@Param`, etc. to accept an optional DTO class argument.
- This allows validation pipes to work correctly in environments where `emitDecoratorMetadata` is not supported or stripped by bundlers like `esbuild`.
- Example: `@Body(CreateUserDto) body: CreateUserDto`
