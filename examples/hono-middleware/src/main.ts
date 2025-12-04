import "reflect-metadata";
import { KarinFactory } from "@project-karin/core";
import { HonoAdapter } from "@project-karin/platform-hono";
import { logger } from "hono/logger";
import { HonoFeaturesController } from "./hono-features.controller";

// 1. Create Adapter
const adapter = new HonoAdapter();

// 2. Access Native Instance for Global Middleware
const hono = adapter.getInstance();
hono.use("*", logger()); // Native Hono Logger

// 3. Create App
const app = await KarinFactory.create(adapter, {
    scan: false,
    controllers: [HonoFeaturesController],
});

await app.init();

export default {
    fetch: (app.getHttpAdapter() as any).fetch,
};
