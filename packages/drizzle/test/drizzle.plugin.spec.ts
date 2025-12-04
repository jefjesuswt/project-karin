import "reflect-metadata";
import { describe, it, expect, beforeEach, mock } from "bun:test";
import { DrizzlePlugin } from "../src/drizzle.plugin";
import { container } from "@project-karin/core";
import { DRIZZLE_DB } from "../src/decorators";
import type { DrizzleAdapter } from "../src/adapter.interface";

// Mock Adapter
class MockAdapter implements DrizzleAdapter<any, any> {
    connect = mock(async () => ({ db: { mockDb: true }, client: { close: mock(), end: mock(), disconnect: mock() } }));
    disconnect = mock(async () => { });
}

describe("DrizzlePlugin", () => {
    let appMock: any;
    let adapter: MockAdapter;

    beforeEach(() => {
        container.reset();
        appMock = { use: mock() };
        adapter = new MockAdapter();
    });

    it("should be defined", () => {
        const plugin = new DrizzlePlugin({ adapter });
        expect(plugin).toBeDefined();
    });

    it("should register db instance", async () => {
        const plugin = new DrizzlePlugin({ adapter });
        await plugin.install(appMock);

        const instance = container.resolve(DRIZZLE_DB);
        expect(instance).toBeDefined();
        expect((instance as any).mockDb).toBe(true);
        expect(adapter.connect).toHaveBeenCalled();
    });

    it("should call adapter.disconnect() on destroy", async () => {
        const plugin = new DrizzlePlugin({ adapter, serverless: false });
        await plugin.install(appMock);
        await plugin.onPluginDestroy();

        expect(adapter.disconnect).toHaveBeenCalled();
    });

    it("should skip disconnect in serverless mode", async () => {
        const plugin = new DrizzlePlugin({ adapter, serverless: true });
        await plugin.install(appMock);
        await plugin.onPluginDestroy();

        expect(adapter.disconnect).not.toHaveBeenCalled();
    });
});
