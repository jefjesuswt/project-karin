import "reflect-metadata";

import {
  type KarinPlugin,
  type KarinApplication,
  Logger,
} from "@project-karin/core";
import { OpenApiBuilder } from "./openapi.builder";
import { generateSwaggerHtml } from "./swagger-ui";

export interface OpenApiPluginOptions {
  path?: string | (() => string);
  title?: string | (() => string);
  version?: string | (() => string);
}

export class OpenApiPlugin implements KarinPlugin {
  name = "OpenApiPlugin";
  private logger = new Logger("OpenAPI");
  private app!: KarinApplication;

  constructor(private readonly options: OpenApiPluginOptions = {}) {}

  install(app: KarinApplication) {
    this.app = app;
  }

  async onPluginInit() {
    const controllers = this.app.getControllers();
    if (!controllers || controllers.length === 0) {
      this.logger.warn(
        "No controllers found via app.getControllers(). Docs might be empty."
      );
    }

    const builder = new OpenApiBuilder(this.app);
    const document = builder.build();

    const title =
      typeof this.options.title === "function"
        ? this.options.title()
        : this.options.title;

    const version =
      typeof this.options.version === "function"
        ? this.options.version()
        : this.options.version;

    const docPath =
      typeof this.options.path === "function"
        ? this.options.path()
        : this.options.path || "/docs";

    if (title) document.info.title = title;
    if (version) document.info.version = version;

    const jsonPath = `${docPath}/json`;
    const adapter = this.app.getHttpAdapter();

    adapter.get(jsonPath, () => document);

    adapter.get(docPath, () => {
      const html = generateSwaggerHtml({
        title: document.info.title,
        jsonUrl: jsonPath,
        version: "5.11.0",
      });

      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    });

    const port = process.env.PORT || 3000;
    this.logger.log(`📚 OpenAPI Docs: http://localhost:${port}${docPath}`);
  }
}
