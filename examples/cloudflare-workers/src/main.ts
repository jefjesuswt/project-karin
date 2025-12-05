import { KarinFactory } from "@project-karin/core";
import { HonoAdapter } from "@project-karin/platform-hono";
import { ConfigPlugin } from "@project-karin/config";
import { RedisPlugin, UpstashAdapter } from "@project-karin/redis";
import { DrizzlePlugin, LibSQLAdapter } from "@project-karin/drizzle";
import { AppController } from "./app/app.controller";
import { users } from "./app/schema";

/**
 * Cloudflare Workers Serverless Example
 * 
 * This example demonstrates how to use Karin.js in a serverless environment
 * with Cloudflare Workers, Upstash Redis, and Turso (LibSQL).
 * 
 * Key differences from traditional server setup:
 * 1. ConfigPlugin is instantiated without options - it will receive env from Cloudflare
 * 2. All plugins use lazy evaluation (() => config.get()) to access env vars
 * 3. Use KarinFactory.serverless() instead of KarinFactory.create()
 * 4. Export default instead of calling app.listen()
 */

// 1. Initialize ConfigPlugin (will receive env from Cloudflare Workers)
const config = new ConfigPlugin();

// 2. Setup Redis with Upstash adapter (serverless-compatible)
const redis = new RedisPlugin({
    adapter: new UpstashAdapter({
        url: () => config.get("UPSTASH_REDIS_URL"),
        token: () => config.get("UPSTASH_REDIS_TOKEN"),
    }),
    serverless: true,
});

// 3. Setup Drizzle with LibSQL adapter (Turso - serverless-compatible)
const drizzle = new DrizzlePlugin({
    adapter: new LibSQLAdapter(
        {
            url: () => config.get("TURSO_DATABASE_URL"),
            authToken: () => config.get("TURSO_AUTH_TOKEN"),
        },
        { schema: [users] }
    ),
    serverless: true,
});

// 4. Create and export the serverless application
export default KarinFactory.serverless(new HonoAdapter(), {
    controllers: [AppController],
    plugins: [config, redis, drizzle],
});
