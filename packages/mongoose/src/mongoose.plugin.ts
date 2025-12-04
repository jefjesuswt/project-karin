import {
  type KarinPlugin,
  type KarinApplication,
  Logger,
  container,
  isServerless,
} from "@project-karin/core";
import mongoose, { type ConnectOptions, type Mongoose } from "mongoose";
import { SCHEMA_METADATA, SCHEMAS_REGISTRY } from "./utils/decorators";
import { SchemaFactory } from "./utils/schema.factory";
import { MongooseExceptionFilter } from "./mongoose-exception.filter";

export interface MongoosePluginOptions {
  uri: string | (() => string);
  options?: ConnectOptions | (() => ConnectOptions);
  models?: Array<new (...args: any[]) => any>;

  autoRegisterExceptionFilter?: boolean;
  serverless?: boolean;
}

export class MongoosePlugin implements KarinPlugin {
  name = "MongoosePlugin";
  private logger = new Logger("Mongoose");
  private connection: Mongoose | null = null;

  constructor(private readonly config: MongoosePluginOptions) {
    if (this.config.serverless === undefined) {
      this.config.serverless = isServerless();
    }

    // In serverless, disable buffering to fail fast if connection is lost
    // instead of hanging until timeout
    if (this.config.serverless) {
      mongoose.set('bufferCommands', false);
    }
  }

  install(app: KarinApplication) {
    if (this.config.autoRegisterExceptionFilter !== false) {
      app.useGlobalFilters(new MongooseExceptionFilter());
      this.logger.log("✅ MongooseExceptionFilter registered automatically");
    }

    if (this.config.models && this.config.models.length > 0) {
      this.config.models.forEach((model) => {
        SCHEMAS_REGISTRY.add(model);
      });
      this.logger.log(
        `Manually registered ${this.config.models.length} entities for Serverless execution.`
      );
    }

    this.registerModels();
  }

  async onPluginInit() {
    this.registerModels();

    if (mongoose.connection.readyState === 1) {
      this.connection = mongoose;
      container.registerInstance("MONGO_CONNECTION", this.connection);
      this.logger.log("✅ Reusing existing MongoDB connection");
      return;
    }

    try {
      const uri = typeof this.config.uri === "function" ? this.config.uri() : this.config.uri;
      if (!uri) throw new Error("URI is required");

      const connectionOptions: ConnectOptions = {
        serverSelectionTimeoutMS: 10000, // Fail fast if server is down
        ...(typeof this.config.options === "function"
          ? this.config.options()
          : (this.config.options || {})),
      };

      this.connection = await mongoose.connect(
        uri,
        connectionOptions
      );

      container.registerInstance("MONGO_CONNECTION", this.connection);
      this.logger.log("✅ Connected to MongoDB");
    } catch (error: any) {
      if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoServerSelectionError') {
        this.logger.error(`Failed to connect to MongoDB: Server selection timed out. Please check if your database server is running and accessible at ${typeof this.config.uri === "function" ? this.config.uri() : this.config.uri}`);
      } else {
        this.logger.error(`Connection failed: ${error.message}`);
      }
      // Disconnect to ensure no pending handles
      await mongoose.disconnect();
      // Exit the process directly to avoid stack trace dump
      process.exit(1);
    }
  }

  private registerModels() {
    if (SCHEMAS_REGISTRY.size === 0) {
      this.logger.warn(
        "No schemas found. If you are in Serverless mode, verify 'models' array in options."
      );
      return;
    }

    for (const ModelClass of SCHEMAS_REGISTRY) {
      const meta = Reflect.getMetadata(SCHEMA_METADATA, ModelClass);

      if (!meta) {
        this.logger.warn(
          `Class '${ModelClass.name}' is registered but missing @Schema decorator.`
        );
        continue;
      }

      const modelName = meta.name || ModelClass.name;
      const schema = SchemaFactory.createForClass(ModelClass as Function);

      const modelInstance =
        mongoose.models[modelName] || mongoose.model(modelName, schema);

      const token = `MONGO_MODEL_${modelName.toUpperCase()}`;
      container.registerInstance(token, modelInstance);

      this.logger.log(`Model registered: ${modelName} -> ${token}`);
    }
  }

  async onPluginDestroy() {
    if (this.config.serverless) {
      this.logger.log("ℹ️ Skipping MongoDB disconnect (Serverless mode)");
      return;
    }
    if (this.connection) {
      await this.connection.disconnect();
    }
  }
}
