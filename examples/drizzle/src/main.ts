import { KarinFactory, ZodValidationPipe } from "@project-karin/core";
import { HonoAdapter } from "@project-karin/platform-hono";
import { DrizzlePlugin, LibSQLAdapter } from "@project-karin/drizzle";
import { ConfigPlugin } from "@project-karin/config";
import { RedisPlugin, UpstashAdapter } from "@project-karin/redis";

import * as usersSchema from "./users/users.schema";
import * as productsSchema from "./products/products.schema";
import { UsersController } from "./users/users.controller";
import { ProductsController } from "./products/products.controller";


async function bootstrap() {
    const config = new ConfigPlugin({
        requiredKeys: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "UPSTASH_REDIS_URL", "UPSTASH_REDIS_TOKEN"],
    });

    const redis = new RedisPlugin({
        adapter: new UpstashAdapter({
            url: () => config.get("UPSTASH_REDIS_URL"),
            token: () => config.get("UPSTASH_REDIS_TOKEN"),
        }),
    });

    const drizzle = new DrizzlePlugin({
        adapter: new LibSQLAdapter(
            {
                url: () => config.get("TURSO_DATABASE_URL"),
                authToken: () => config.get("TURSO_AUTH_TOKEN"),
            },
            { schema: [usersSchema, productsSchema] }
        ),
    });

    const app = await KarinFactory.create(new HonoAdapter(), {
        plugins: [config, redis, drizzle],
        controllers: [UsersController, ProductsController],
        globalPipes: [new ZodValidationPipe()],
    });

    app.listen(3000);
}

bootstrap();
