import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { DrizzleAdapter } from "../adapter.interface";
import type { DrizzleConfig } from "drizzle-orm";

export type NeonConfig = string | (() => string);

export type NeonOptions = Omit<DrizzleConfig<any>, "schema"> & {
    schema?: DrizzleConfig<any>["schema"] | DrizzleConfig<any>["schema"][];
};

export class NeonAdapter implements DrizzleAdapter<NeonHttpDatabase, NeonQueryFunction<any, any>> {
    constructor(
        private readonly connectionString: NeonConfig,
        private readonly options?: NeonOptions
    ) { }

    async connect() {
        const url = typeof this.connectionString === "function"
            ? this.connectionString()
            : this.connectionString;

        const client = neon(url);

        // Validate connection (Neon serverless client is stateless, but we can try a query)
        try {
            await client`SELECT 1`;
        } catch (error: any) {
            throw new Error(`Failed to connect to Neon: ${error.message}`);
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

    async disconnect(client: NeonQueryFunction<any, any>) {
        // Neon serverless driver (HTTP) doesn't have a persistent connection to close
        // But if we were using WebSockets, we might need to close it.
        // For 'neon-http', it's stateless.
    }
}
