# Karin.js Cloudflare Workers Example

This example demonstrates how to use Karin.js in a **serverless environment** with Cloudflare Workers, featuring:

- 🔥 **Cloudflare Workers** - Edge runtime deployment
- 🗄️ **Turso (LibSQL)** - Serverless SQLite database
- 🔴 **Upstash Redis** - Serverless Redis for caching
- 🦊 **Hono** - Lightweight web framework
- ⚡ **Drizzle ORM** - Type-safe database queries

## Key Differences: Serverless vs Traditional Server

### Serverless (Cloudflare Workers)
```typescript
const config = new ConfigPlugin();

const redis = new RedisPlugin({
  adapter: new UpstashAdapter({
    url: () => config.get("UPSTASH_REDIS_URL"),
    token: () => config.get("UPSTASH_REDIS_TOKEN"),
  }),
  serverless: true,
});

export default KarinFactory.serverless(new HonoAdapter(), {
  controllers: [AppController],
  plugins: [config, redis, drizzle],
});
```

### Traditional Server (Node.js/Bun)
```typescript
async function bootstrap() {
  const config = new ConfigPlugin({
    requiredKeys: ["DATABASE_URL"],
  });

  const drizzle = new DrizzlePlugin({
    adapter: new MysqlAdapter(
      () => config.get("DATABASE_URL"),
      { schema: [usersSchema] }
    ),
  });

  const app = await KarinFactory.create(new HonoAdapter(), {
    plugins: [config, drizzle],
    controllers: [AppController],
  });

  app.listen(3000);
}

bootstrap();
```

## Setup

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Environment Variables

Copy the example file:
```bash
cp .dev.vars.example .dev.vars
```

Fill in your actual credentials in `.dev.vars`:
```env
UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token

TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token
```

### 3. Setup Turso Database

Create a Turso database and run migrations:
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create karin-example

# Get connection string
turso db show karin-example --url

# Create auth token
turso db tokens create karin-example
```

### 4. Setup Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and token

## Development

Run the development server:
```bash
bun dev
```

The server will start at `http://localhost:8787`

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Get All Users (with caching)
```bash
GET /api/users
```

### Get User by ID (with caching)
```bash
GET /api/users/:id
```

### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Cache Statistics
```bash
GET /api/cache/stats
```

## Deployment

Deploy to Cloudflare Workers:
```bash
bun run deploy
```

Make sure to set your environment variables in the Cloudflare dashboard:
1. Go to Workers & Pages > Your Worker > Settings > Variables
2. Add the same environment variables from `.dev.vars`

## How ConfigPlugin Works in Serverless

In Cloudflare Workers, environment variables are passed through the `env` object in the fetch handler. Karin.js automatically:

1. Detects the serverless environment
2. Extracts the `env` object from the request context
3. Passes it to `ConfigPlugin` during initialization
4. Makes it available via `config.get()`

This is why you can instantiate `ConfigPlugin` without options in serverless mode - it receives the environment variables automatically from the Cloudflare Workers runtime.

## Learn More

- [Karin.js Documentation](https://github.com/jefjesuswt/project-karin)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Turso Documentation](https://docs.turso.tech/)
- [Upstash Redis](https://upstash.com/)
