# @project-karin/cli

## 1.0.0

### Minor Changes

- f2ec848: feat: universal serverless support & full SQL adapters

  - **Core**: Added `KarinFactory.serverless()` for universal environment hydration.
  - **Drizzle**: Added `PostgresAdapter`, `MysqlAdapter`, and `NeonAdapter`.
  - **Redis**: Refactored to use Adapter pattern.
  - **CLI**: Renamed project to "Karin" and improved templates.

## 0.5.4

## 0.5.3

### Patch Changes

- 60c503e: adpters on redis package

## 0.5.2

### Patch Changes

- 5c76655: Fix: Replace workspace protocol with explicit versions to resolve installation issues in consuming projects.

## 0.5.1

### Patch Changes

- 51c73d4: Fix: Update CLI to migrate legacy package names and resolve publishing conflicts.
