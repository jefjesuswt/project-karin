# @karin-js/drizzle

Drizzle ORM integration plugin for Karin-JS.

## Installation

```bash
bun add @karin-js/drizzle drizzle-orm
```

You will also need a driver, for example `postgres`, `mysql2`, or `@libsql/client`.

## Usage

### Basic Setup (e.g. with Turso/LibSQL)

```typescript
import { DrizzlePlugin } from "@karin-js/drizzle";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

// Initialize client and db
const client = createClient({ 
  url: process.env.TURSO_DATABASE_URL, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});
const db = drizzle(client);

const app = await KarinFactory.create(adapter, {
  plugins: [
    new DrizzlePlugin({
      db,
      client, // Pass client to handle graceful shutdown
    }),
  ],
});
```

### Lazy Initialization

You can pass a factory function to initialize the DB only when the plugin installs.

```typescript
new DrizzlePlugin({
  db: () => {
    const client = createClient({ ... });
    return drizzle(client);
  },
  // If you need to close the client, use onDisconnect with lazy init
  onDisconnect: async (db) => {
    // You might need to access the client from the db object if possible, 
    // or manage the client scope differently.
  }
})
```

### Dependency Injection

Inject the database instance into your services.

```typescript
import { InjectDrizzle } from "@karin-js/drizzle";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { users } from "./schema";

@Service()
class UserService {
  constructor(@InjectDrizzle() private db: LibSQLDatabase) {}

  async findAll() {
    return this.db.select().from(users);
  }
}
```

### Serverless Support

The plugin automatically detects serverless environments (AWS Lambda, Vercel, Cloudflare Workers, etc.) and skips the disconnection step to allow connection reuse (Warm Starts).

You can override this behavior:

```typescript
new DrizzlePlugin({
  db,
  serverless: true // Force serverless mode
})
```

## Options

```typescript
interface DrizzlePluginOptions {
  db: any | (() => any);
  client?: any;
  onDisconnect?: (db: any, client?: any) => Promise<void> | void;
  token?: string;
  serverless?: boolean;
}
```
