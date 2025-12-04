import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient, type Client, type Config } from "@libsql/client";
import type { DrizzleAdapter } from "../adapter.interface";
import type { DrizzleConfig } from "drizzle-orm";

export type LibSQLConfig = Config | (() => Config) | {
    [K in keyof Config]: Config[K] | (() => Config[K]);
};

export type LibSQLOptions = Omit<DrizzleConfig<any>, "schema"> & {
    schema?: DrizzleConfig<any>["schema"] | DrizzleConfig<any>["schema"][];
};

export class LibSQLAdapter implements DrizzleAdapter<LibSQLDatabase, Client> {
    constructor(
        private readonly config: LibSQLConfig,
        private readonly options?: LibSQLOptions
    ) { }

    async connect() {
        let config: Config;
        if (typeof this.config === "function") {
            config = this.config();
        } else {
            const resolved: any = {};
            for (const [key, value] of Object.entries(this.config)) {
                resolved[key] = typeof value === "function" ? value() : value;
            }
            config = resolved as Config;
        }

        const client = createClient(config);

        // Validate connection
        try {
            await client.execute("SELECT 1");
        } catch (error: any) {
            client.close();
            throw new Error(`Failed to connect to LibSQL/Turso: ${error.message}`);
        }

        let drizzleOptions = this.options as DrizzleConfig<any> | undefined;
        let registeredSchemas: string[] = [];

        // Handle schema array merging
        if (this.options?.schema && Array.isArray(this.options.schema)) {
            const mergedSchema = this.options.schema.reduce((acc, curr) => ({ ...acc, ...curr }), {});
            drizzleOptions = { ...this.options, schema: mergedSchema };
            registeredSchemas = Object.keys(mergedSchema);
        } else if (this.options?.schema) {
            registeredSchemas = Object.keys(this.options.schema);
        }

        const db = drizzle(client, drizzleOptions ?? {});
        return { db, client, registeredSchemas };
    }

    async disconnect(client: Client) {
        client.close();
    }
}