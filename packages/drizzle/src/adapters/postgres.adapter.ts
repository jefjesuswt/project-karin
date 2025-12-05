import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import type { DrizzleAdapter } from "../adapter.interface";
import type { DrizzleConfig } from "drizzle-orm";

export type PostgresConfig = string | PoolConfig | (() => string | PoolConfig);

export type PostgresOptions = Omit<DrizzleConfig<any>, "schema"> & {
    schema?: DrizzleConfig<any>["schema"] | DrizzleConfig<any>["schema"][];
};

export class PostgresAdapter implements DrizzleAdapter<NodePgDatabase, Pool> {
    constructor(
        private readonly config: PostgresConfig,
        private readonly options?: PostgresOptions
    ) { }

    async connect() {
        let poolConfig: PoolConfig;

        if (typeof this.config === "function") {
            const result = this.config();
            poolConfig = typeof result === "string" ? { connectionString: result } : result;
        } else if (typeof this.config === "string") {
            poolConfig = { connectionString: this.config };
        } else {
            poolConfig = this.config;
        }

        const client = new Pool(poolConfig);

        // Validate connection
        try {
            const connection = await client.connect();
            connection.release();
        } catch (error: any) {
            await client.end();
            throw new Error(`Failed to connect to Postgres: ${error.message}`);
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

    async disconnect(client: Pool) {
        await client.end();
    }
}
