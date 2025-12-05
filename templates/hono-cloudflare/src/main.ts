import { KarinFactory } from "@project-karin/core";
import { HonoAdapter } from "@project-karin/platform-hono";
import { AppController } from "./app/app.controller";

const handler = KarinFactory.serverless(new HonoAdapter(), {
  controllers: [AppController],
});

export default handler;
