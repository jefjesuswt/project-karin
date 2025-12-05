# Karin + Drizzle + Turso Example

This example demonstrates how to use **Karin** with **Drizzle ORM** and **Turso (LibSQL)** in a serverless-ready environment.

## Setup

1. Copy `.env.template` to `.env`:
   ```bash
   cp .env.template .env
   ```

2. Fill in your Turso credentials in `.env`:
   ```env
   TURSO_DATABASE_URL=libsql://...
   TURSO_AUTH_TOKEN=...
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

## Run

```bash
bun dev
```

## Endpoints

- `GET /users`: List all users
- `POST /users`: Create a user (`{ "name": "John", "email": "john@example.com" }`)
