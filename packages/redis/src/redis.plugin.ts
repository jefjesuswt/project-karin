import {
  type KarinPlugin,
  type KarinApplication,
  Logger,
  container,
  isServerless,
} from "@project-karin/core";
import { REDIS_CLIENT_TOKEN } from "./decorators";
import { RedisAdapter } from "./adapters/adapter.interface";

export interface RedisPluginOptions<Client = any> {
  adapter: RedisAdapter<Client>;
  name?: string;
  serverless?: boolean;
  failureStrategy?: "fail" | "warn";
}

export class RedisPlugin<Client = any> implements KarinPlugin {
  name = "RedisPlugin";
  private logger = new Logger("Redis");
  private client: Client | undefined;
  private serverless: boolean;

  constructor(private readonly options: RedisPluginOptions<Client>) {
    this.serverless = options.serverless ?? isServerless();
  }

  install(app: KarinApplication) { }

  async onPluginInit() {
    if (this.client) {
      return;
    }
    this.logger.log("Initializing connection...");
    try {
      this.client = await this.options.adapter.connect();

      container.registerInstance(REDIS_CLIENT_TOKEN, this.client);

      this.logger.log("✅ Connection established");
    } catch (error: any) {
      if (this.options.failureStrategy === "warn") {
        this.logger.warn(`⚠️ Connection failed: ${error.message}. App continuing without Redis.`);
        return;
      }
      this.logger.error(`❌ Connection failed: ${error.message}`);
      throw error;
    }
  }

  async onPluginDestroy() {
    if (this.serverless) {
      this.logger.log("ℹ️ Skipping Redis disconnect (Serverless mode)");
      return;
    }

    if (this.client) {
      await this.options.adapter.disconnect(this.client);
      this.logger.log("✅ Redis disconnected");
    }
  }
}
