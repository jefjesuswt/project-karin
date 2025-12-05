import "reflect-metadata";
import { describe, it, expect, mock, spyOn } from "bun:test";
import { MysqlAdapter } from "../src/adapters/mysql.adapter";
import { DrizzlePlugin } from "../src/drizzle.plugin";

// Mock mysql2/promise
mock.module("mysql2/promise", () => {
    return {
        default: {
            createPool: (config: any) => ({
                getConnection: async () => ({}),
                releaseConnection: () => { },
                end: async () => { },
            })
        }
    };
});

// Mock drizzle-orm/mysql2
mock.module("drizzle-orm/mysql2", () => {
    return {
        drizzle: (client: any, options: any) => ({
            _client: client,
            _options: options
        })
    };
});

describe("MysqlAdapter", () => {
    it("should be defined", () => {
        const adapter = new MysqlAdapter("mysql://user:pass@localhost:3306/db");
        expect(adapter).toBeDefined();
    });

    it("should connect and return db instance", async () => {
        const adapter = new MysqlAdapter("mysql://user:pass@localhost:3306/db");
        const result = await adapter.connect();

        expect(result.db).toBeDefined();
        expect(result.client).toBeDefined();
    });

    it("should resolve config from function", async () => {
        const adapter = new MysqlAdapter(() => "mysql://user:pass@localhost:3306/db");
        const result = await adapter.connect();

        expect(result.db).toBeDefined();
    });

    it("should handle schema merging", async () => {
        const schema1 = { users: {} };
        const schema2 = { posts: {} };

        const adapter = new MysqlAdapter(
            "mysql://user:pass@localhost:3306/db",
            { schema: [schema1, schema2] as any }
        );

        const result = await adapter.connect();
        expect(result.registeredSchemas).toContain("users");
        expect(result.registeredSchemas).toContain("posts");
    });
});

describe("DrizzlePlugin with MysqlAdapter", () => {
    it("should install and initialize with MysqlAdapter", async () => {
        const adapter = new MysqlAdapter("mysql://user:pass@localhost:3306/db");
        const plugin = new DrizzlePlugin({ adapter });

        const appMock = { getRootPath: () => "/" } as any;
        await plugin.install();

        expect((plugin as any).db).toBeDefined();
    });
});
