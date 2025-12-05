import { KarinFactory, Logger } from "@project-karin/core";
import { H3Adapter } from "@project-karin/platform-h3";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const port = 3000;

  const app = await KarinFactory.create(new H3Adapter(), {
    scan: "./src/**/*.ts",
  });

  app.listen(port, () => {
    logger.info(`Karin now listening on port ${port}! 🚀`);
  });
}

bootstrap();
