import "reflect-metadata";
import { describe, it, expect, mock, spyOn } from "bun:test";
import { NeonAdapter } from "../src/adapters/neon.adapter";
import { DrizzlePlugin } from "../src/drizzle.plugin";
import { container } from "@project-karin/core";

// Mock @neondatabase/serverless
mock.module("@neondatabase/serverless", () => {
    return {
        neon: (url: string) => {
            const mockClient = (query: any) => {
                if (query[0] === "SELECT 1") return Promise.resolve([{ 1: 1 }]);
                return Promise.resolve([]);
            };
            return mockClient;
        }
    };
});

// Mock drizzle-orm/neon-http
mock.module("drizzle-orm/neon-http", () => {
    return {
        drizzle: (client: any, options: any) => ({
            _client: client,
            _options: options
        })
    };
});

describe("NeonAdapter", () => {
    it("should be defined", () => {
        const adapter = new NeonAdapter("postgres://user:pass@host/db");
        expect(adapter).toBeDefined();
    });

    it("should connect and return db instance", async () => {
        const adapter = new NeonAdapter("postgres://user:pass@host/db");
        const result = await adapter.connect();

        expect(result.db).toBeDefined();
        expect(result.client).toBeDefined();
    });

    it("should resolve connection string from function", async () => {
        const adapter = new NeonAdapter(() => "postgres://user:pass@host/db");
        const result = await adapter.connect();

        expect(result.db).toBeDefined();
    });

    it("should handle schema merging", async () => {
        const schema1 = { users: {} };
        const schema2 = { posts: {} };

        const adapter = new NeonAdapter("postgres://user:pass@host/db", {
            schema: [schema1, schema2] as any
        });

        const result = await adapter.connect();
        expect(result.registeredSchemas).toContain("users");
        expect(result.registeredSchemas).toContain("posts");
    });
});

describe("DrizzlePlugin with NeonAdapter", () => {
    it("should install and initialize with NeonAdapter", async () => {
        const adapter = new NeonAdapter("postgres://user:pass@host/db");
        const plugin = new DrizzlePlugin({ adapter });

        const appMock = { getRootPath: () => "/" } as any;
        await plugin.install();

        // Check if DRIZZLE_DB is registered in container
        // We can't easily check the container content without resolving, 
        // but since we mocked everything, it should pass without error.
        // Let's verify the plugin properties
        expect((plugin as any).db).toBeDefined();
    });
});
