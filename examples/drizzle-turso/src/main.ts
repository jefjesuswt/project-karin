import { KarinFactory } from "@karin-js/core";
import { HonoAdapter } from "@karin-js/platform-hono";
import { DrizzlePlugin, LibSQLAdapter } from "@karin-js/drizzle";
import { ConfigPlugin } from "@karin-js/config";

import * as usersSchema from "./users/users.schema";
import * as productsSchema from "./products/products.schema";
import { UsersController } from "./users/users.controller";
import { ProductsController } from "./products/products.controller";


async function bootstrap() {
    const config = new ConfigPlugin({
        requiredKeys: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"],
    });

    const drizz = new DrizzlePlugin({
        adapter: new LibSQLAdapter({
            url: () => config.get("TURSO_DATABASE_URL"),
            authToken: () => config.get("TURSO_AUTH_TOKEN"),
        }, { schema: [usersSchema, productsSchema] }),
    });

    const app = await KarinFactory.create(new HonoAdapter(), {
        plugins: [config, drizz],
        controllers: [UsersController, ProductsController],
    });

    app.listen(3000);
}

bootstrap();
