import { KarinFactory } from "@project-karin/core";
import { HonoAdapter } from "@project-karin/platform-hono";
import { DrizzlePlugin, MysqlAdapter } from "@project-karin/drizzle";
import { ConfigPlugin } from "@project-karin/config";

import * as usersSchema from "./users/users.schema";
import * as productsSchema from "./products/products.schema";
import { UsersController } from "./users/users.controller";
import { ProductsController } from "./products/products.controller";


async function bootstrap() {
    const config = new ConfigPlugin({
        requiredKeys: ["MARIADB_DATABASE_URL"],
    });

    const drizz = new DrizzlePlugin({
        adapter: new MysqlAdapter(
            () => config.get("MARIADB_DATABASE_URL"),
            { schema: [usersSchema, productsSchema] }
        ),
    });

    const app = await KarinFactory.create(new HonoAdapter(), {
        plugins: [config, drizz],
        controllers: [UsersController, ProductsController],
    });

    app.listen(3000);
}

bootstrap();
