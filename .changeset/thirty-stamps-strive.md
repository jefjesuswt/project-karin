---
"@project-karin/platform-h3": patch
"@project-karin/cli": patch
"@project-karin/core": patch
---

## Build System & Deno Compatibility

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

