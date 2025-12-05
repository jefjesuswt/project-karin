import { KarinFactory, Logger } from "@project-karin/core";
import { HonoAdapter } from "@project-karin/platform-hono";
import { ConfigPlugin } from "@project-karin/config";
import { MongoosePlugin } from "@project-karin/mongoose";
import { OpenApiPlugin } from "../../../packages/openapi";
import { RedisPlugin } from "@project-karin/redis";
import { HttpErrorFilter } from "./filters/http.filter";
import { DogsController } from "./dogs/dogs.controller";
import { FoxesController } from "./foxes/foxes.controller";
import { Dogs } from "./dogs/entities/dogs.entity";
import { Foxes } from "./foxes/entities/foxes.entity";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const config = new ConfigPlugin({
    requiredKeys: ["MONGO_URI", "DB_NAME", "PORT", "REDIS_URL"],
  });

  const mongoose = new MongoosePlugin({
    uri: () => config.get("MONGO_URI"),
    options: () => ({
      dbName: config.get("DB_NAME"),
      authSource: "admin",
    }),
    models: [Dogs, Foxes],
  });

  const openapi = new OpenApiPlugin({
    path: "/docs",
    title: "Karin API",
    version: "1.0.0",
  });

  const redis = new RedisPlugin({
    url: () => config.get("REDIS_URL"),
    failureStrategy: "warn",
  });

  const app = await KarinFactory.create(new HonoAdapter(), {
    // scan: "./src/**/*.ts",
    plugins: [
      config,
      mongoose,
      openapi,
      redis
    ],
    globalFilters: [
      new HttpErrorFilter(),
    ],
    controllers: [DogsController, FoxesController],
  });

  const port = parseInt(config.get("PORT") || "3000", 10);

  app.listen(port, () => {
    logger.log(
      `🦊 Karin API running on http://localhost:${port}`
    );
  });
}

bootstrap();
