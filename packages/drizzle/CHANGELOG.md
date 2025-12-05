# @project-karin/drizzle

## 0.5.5

### Patch Changes

- 8ee7432: feat: universal serverless support & full SQL adapters

  - **Core**: Added `KarinFactory.serverless()` for universal environment hydration.
  - **Drizzle**: Added `PostgresAdapter`, `MysqlAdapter`, and `NeonAdapter`.
  - **Redis**: Refactored to use Adapter pattern.
  - **CLI**: Renamed project to "Karin" and improved templates.

- Updated dependencies [8ee7432]
  - @project-karin/core@0.5.5

## 0.5.4

### Patch Changes

- @project-karin/core@0.5.4

## 0.5.3

### Patch Changes

- 60c503e: adpters on redis package
- Updated dependencies [60c503e]
  - @project-karin/core@0.5.3

## 0.5.2

### Patch Changes

- 5c76655: Fix: Replace workspace protocol with explicit versions to resolve installation issues in consuming projects.
- Updated dependencies [5c76655]
  - @project-karin/core@0.5.2

## 0.5.1

### Patch Changes

- 51c73d4: Fix: Update CLI to migrate legacy package names and resolve publishing conflicts.
- Updated dependencies [51c73d4]
  - @project-karin/core@0.5.1
