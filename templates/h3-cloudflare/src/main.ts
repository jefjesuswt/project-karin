import { KarinFactory } from "@project-karin/core";
import { H3Adapter } from "@project-karin/platform-h3";
import { AppController } from "./app/app.controller";

const handler = KarinFactory.serverless(new H3Adapter(), {
  controllers: [AppController],
});

export default handler;
