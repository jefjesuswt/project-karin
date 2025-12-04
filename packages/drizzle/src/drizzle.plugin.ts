import {
    type KarinPlugin,
    type KarinApplication,
    Logger,
    container,
    isServerless,
} from "@project-karin/core";
import { DRIZZLE_DB } from "./decorators";
import type { DrizzleAdapter } from "./adapter.interface";

export interface DrizzlePluginOptions<DB = unknown, Client = unknown> {
    /**
     * The database adapter to use (e.g. LibSQLAdapter, PostgresAdapter)
     */
    adapter: DrizzleAdapter<DB, Client>;

    /**
     * Dependency injection token (default: DRIZZLE_DB)
     */
    token?: string;

    /**
     * Enable serverless mode (skips disconnect).
     * Default: Auto-detected via environment variables.
     */
    serverless?: boolean;
}

export class DrizzlePlugin<DB = unknown, Client = unknown> implements KarinPlugin {
    name = "DrizzlePlugin";
    private logger = new Logger("Drizzle");
    private db: DB | undefined;
    private client: Client | undefined;
    private serverless: boolean;

    constructor(private readonly config: DrizzlePluginOptions<DB, Client>) {
        this.serverless = config.serverless ?? isServerless();
    }

    async install() {
        let registeredSchemas: readonly string[] = [];

        try {
            const result = await this.config.adapter.connect();
            this.db = result.db;
            this.client = result.client;
            registeredSchemas = result.registeredSchemas || [];
        } catch (error: any) {
            this.logger.error(`Failed to connect to Drizzle Database: ${error.message}`);
            process.exit(1);
        }
        this.logger.log("✅ Connected to Drizzle Database");

        if (registeredSchemas && registeredSchemas.length > 0) {
            for (const schemaName of registeredSchemas) {
                this.logger.log(`Schema registered: ${schemaName}`);
            }
        }

        const token = this.config.token || DRIZZLE_DB;
        container.registerInstance(token, this.db);
        this.logger.log(`✅ Drizzle ORM registered (${token})`);
    }

    async onPluginInit() {
        // Connection is established in install()
    }

    async onPluginDestroy() {
        if (this.serverless) {
            this.logger.log("ℹ️ Skipping Drizzle disconnect (Serverless mode)");
            return;
        }

        if (this.client) {
            await this.config.adapter.disconnect(this.client);
            this.logger.log("✅ Drizzle connection closed");
        }
    }
}

