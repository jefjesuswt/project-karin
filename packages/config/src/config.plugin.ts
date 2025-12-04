import {
  type KarinPlugin,
  type KarinApplication,
  Logger,
  container,
} from "@project-karin/core";
import { config } from "dotenv";
import { ZodError, type ZodType } from "zod";
import { ConfigService } from "./config.service";
import { join } from "path";
import { existsSync } from "fs";

export interface ConfigPluginOptions<T = any, K extends string = string> {
  /**
   * Explicitly pass environment variables (e.g. from Cloudflare Workers 'env' object).
   * If provided, .env file loading and process.env fallback are skipped unless you manually merge them.
   */
  env?: Record<string, any>;
  envFilePath?: string;
  schema?: ZodType<T>;
  load?: () => T;
  passthrough?: boolean;
  required?: boolean;
  requiredKeys?: K[] | readonly K[];
}

export class ConfigPlugin<T = any> implements KarinPlugin {
  name = "ConfigPlugin";
  private logger = new Logger("Config");
  private service!: ConfigService<T>;

  constructor(private readonly options: ConfigPluginOptions<T> = {}) { }

  install(app: KarinApplication) {
    let rawConfig: any = {};

    // 1. Priority: Explicitly passed environment (Serverless / IoC)
    if (this.options.env) {
      rawConfig = this.options.env;
    }
    // 2. Priority: Custom loader
    else if (this.options.load) {
      rawConfig = this.options.load();
    }
    // 3. Priority: Fallback to Node.js/Bun process.env + .env file
    else {
      // Load .env file if not disabled (implicit check, logic preserved from original)
      const envPath = this.options.envFilePath
        ? this.options.envFilePath
        : join(app.getRootPath(), ".env");

      if (existsSync(envPath)) {
        const originalLog = console.log;
        try {
          console.log = () => { };
          const result = config({ path: envPath });
          if (result.error) {
            throw result.error;
          }
        } catch (err) {
          this.logger.warn(
            `Could not load .env file: ${(err as Error).message}`
          );
        } finally {
          console.log = originalLog;
        }
      } else {
        if (this.options.required && process.env.NODE_ENV !== "production") {
          this.logger.warn(`⚠️ .env file not found at ${envPath}`);
        }
      }

      rawConfig = typeof process !== "undefined" ? process.env : {};
    }

    // 4. Validation & Transformation
    let finalConfig: any;

    if (this.options.schema) {
      const validation = this.options.schema.safeParse(rawConfig);
      if (!validation.success) {
        const zerr = validation.error as ZodError<any>;
        this.logger.error("❌ Configuration validation failed:");
        zerr.issues.forEach((err) => {
          this.logger.error(`   - ${err.path.join(".")}: ${err.message}`);
        });

        this.logger.error("🛑 Startup aborted due to invalid configuration.");

        throw new Error("Invalid Configuration");
      }
      finalConfig = validation.data;
    } else if (this.options.requiredKeys && this.options.requiredKeys.length > 0) {
      const missingKeys = this.options.requiredKeys.filter(
        (key) => !rawConfig[key]
      );

      if (missingKeys.length > 0) {
        this.logger.error(
          `❌ Missing required environment variables: ${missingKeys.join(", ")}`
        );
        this.logger.error("🛑 Startup aborted due to missing configuration.");
        throw new Error(
          `Missing required environment variables: ${missingKeys.join(", ")}`
        );
      }

      // Filter to only include required keys
      finalConfig = {};
      for (const key of this.options.requiredKeys) {
        finalConfig[key] = rawConfig[key];
      }
    } else {
      finalConfig = rawConfig;
    }

    // 5. Register ConfigService
    this.service = new ConfigService();
    this.service.loadFromObject(finalConfig);

    // Register the service instance in the container
    container.registerInstance(ConfigService, this.service);

    const keysCount = Object.keys(finalConfig).length;
    this.logger.log(`Loaded configuration (${keysCount} keys)`);
  }

  public get<Key extends keyof T>(key: Key): NonNullable<T[Key]>;
  public get<R = any>(key: string): R;
  public get(key: any): any {
    if (!this.service) {
      throw new Error(
        "ConfigPlugin has not been installed. Call app.use(plugin) first."
      );
    }
    try {
      return this.service.get(key);
    } catch (error) {
      this.logger.error((error as Error).message);
      throw error;
    }
  }
}
