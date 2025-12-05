import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql, { type Pool, type PoolOptions } from "mysql2/promise";
import type { DrizzleAdapter } from "../adapter.interface";
import type { DrizzleConfig } from "drizzle-orm";

export type MysqlConfig = string | PoolOptions | (() => string | PoolOptions);

export type MysqlOptions = Omit<DrizzleConfig<any>, "schema"> & {
    schema?: DrizzleConfig<any>["schema"] | DrizzleConfig<any>["schema"][];
};

export class MysqlAdapter implements DrizzleAdapter<MySql2Database, Pool> {
    constructor(
        private readonly config: MysqlConfig,
        private readonly options?: MysqlOptions
    ) { }

    async connect() {
        let poolConfig: PoolOptions;

        if (typeof this.config === "function") {
            const result = this.config();
            poolConfig = typeof result === "string" ? { uri: result } : result;
        } else if (typeof this.config === "string") {
            poolConfig = { uri: this.config };
        } else {
            poolConfig = this.config;
        }

        const client = mysql.createPool(poolConfig);

        // Validate connection
        try {
            const connection = await client.getConnection();
            client.releaseConnection(connection);
        } catch (error: any) {
            await client.end();
            throw new Error(`Failed to connect to MySQL: ${error.message}`);
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

        const db = drizzle(client, { mode: "default", ...drizzleOptions });
        return { db, client, registeredSchemas };
    }

    async disconnect(client: Pool) {
        await client.end();
    }
}
