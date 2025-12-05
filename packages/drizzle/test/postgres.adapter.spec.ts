import "reflect-metadata";
import { describe, it, expect, mock, spyOn } from "bun:test";
import { PostgresAdapter } from "../src/adapters/postgres.adapter";
import { DrizzlePlugin } from "../src/drizzle.plugin";

// Mock pg
mock.module("pg", () => {
    class MockPool {
        constructor(public config: any) { }
        connect() {
            return Promise.resolve({
                release: () => { },
                query: () => Promise.resolve({ rows: [], rowCount: 0 })
            });
        }
        end() { return Promise.resolve(); }
    }
    return {
        default: { Pool: MockPool },
        Pool: MockPool,
        types: { setTypeParser: () => { } }
    };
});

// Mock drizzle-orm/node-postgres
mock.module("drizzle-orm/node-postgres", () => {
    return {
        drizzle: (client: any, options: any) => ({
            _client: client,
            _options: options
        })
    };
});

describe("PostgresAdapter", () => {
    it("should be defined", () => {
        const adapter = new PostgresAdapter({ connectionString: "postgres://localhost:5432/db" });
        expect(adapter).toBeDefined();
    });

    it("should connect and return db instance", async () => {
        const adapter = new PostgresAdapter({ connectionString: "postgres://localhost:5432/db" });
        const result = await adapter.connect();

        expect(result.db).toBeDefined();
        expect(result.client).toBeDefined();
    });

    it("should resolve config from function", async () => {
        const adapter = new PostgresAdapter(() => ({ connectionString: "postgres://localhost:5432/db" }));
        const result = await adapter.connect();

        expect(result.db).toBeDefined();
    });

    it("should handle schema merging", async () => {
        const schema1 = { users: {} };
        const schema2 = { posts: {} };

        const adapter = new PostgresAdapter(
            { connectionString: "postgres://localhost:5432/db" },
            { schema: [schema1, schema2] as any }
        );

        const result = await adapter.connect();
        expect(result.registeredSchemas).toContain("users");
        expect(result.registeredSchemas).toContain("posts");
    });
});

describe("DrizzlePlugin with PostgresAdapter", () => {
    it("should install and initialize with PostgresAdapter", async () => {
        const adapter = new PostgresAdapter({ connectionString: "postgres://localhost:5432/db" });
        const plugin = new DrizzlePlugin({ adapter });

        const appMock = { getRootPath: () => "/" } as any;
        await plugin.install();

        expect((plugin as any).db).toBeDefined();
    });
});
