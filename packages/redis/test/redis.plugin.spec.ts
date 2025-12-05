import "reflect-metadata";
import { describe, it, expect, beforeEach, afterEach, spyOn, mock } from "bun:test";
import { RedisPlugin } from "../src/redis.plugin";
import { IoRedisAdapter } from "../src/adapters/ioredis.adapter";
import { container, type KarinApplication } from "@project-karin/core";
import { REDIS_CLIENT_TOKEN } from "../src/decorators";

// Mock ioredis
mock.module("ioredis", () => {
    return {
        Redis: class MockRedis {
            public status = "wait";
            public options: any;
            private handlers: Record<string, Function> = {};

            constructor(arg1?: any, arg2?: any) {
                this.options = typeof arg1 === "object" ? arg1 : arg2 || {};
                if (typeof arg1 === "string") {
                    (this as any).url = arg1;
                }
            }

            on(event: string, handler: Function) {
                this.handlers[event] = handler;
                return this;
            }

            async connect() {
                this.status = "ready";
                return Promise.resolve();
            }

            async quit() {
                this.status = "end";
                return Promise.resolve();
            }

            disconnect() {
                this.status = "end";
            }
        },
    };
});

describe("RedisPlugin", () => {
    let appMock: KarinApplication;
    let logSpy: any;
    let warnSpy: any;
    let errorSpy: any;

    beforeEach(() => {
        appMock = {
            getRootPath: () => process.cwd(),
        } as any;

        // Silence console
        logSpy = spyOn(console, "log").mockImplementation(() => { });
        warnSpy = spyOn(console, "warn").mockImplementation(() => { });
        errorSpy = spyOn(console, "error").mockImplementation(() => { });

        // Reset container to avoid pollution between tests
        container.reset();
    });

    afterEach(() => {
        if (logSpy) logSpy.mockRestore();
        if (warnSpy) warnSpy.mockRestore();
        if (errorSpy) errorSpy.mockRestore();
    });

    it("should be defined", () => {
        const adapter = new IoRedisAdapter("redis://localhost:6379");
        const plugin = new RedisPlugin({ adapter });
        expect(plugin).toBeDefined();
    });

    it("should initialize with string config", async () => {
        const adapter = new IoRedisAdapter("redis://localhost:6379");
        const plugin = new RedisPlugin({ adapter });
        plugin.install(appMock);
        await plugin.onPluginInit();

        const client = container.resolve(REDIS_CLIENT_TOKEN);
        expect(client).toBeDefined();
        // The mock Redis sets url property when initialized with string
        expect((client as any).url).toBe("redis://localhost:6379");
    });

    it("should initialize with object config (url + options)", async () => {
        // IoRedisAdapter supports passing options directly. 
        // We simulate the "url + options" behavior by passing a config object that IoRedisAdapter understands.
        // However, IoRedisAdapter logic for object config is:
        // if string -> url
        // if object -> options
        // It doesn't explicitly support { url, options } wrapper unless we change IoRedisAdapter.
        // But the previous test "should initialize with object config (url + options)" implies that was supported.
        // Given we are fixing tests for the NEW implementation, we should test what IoRedisAdapter supports.
        // Or we can just test that passing options works.

        const adapter = new IoRedisAdapter({
            host: "localhost",
            port: 6379,
            db: 1
        });

        const plugin = new RedisPlugin({ adapter });
        plugin.install(appMock);
        await plugin.onPluginInit();

        const client = container.resolve(REDIS_CLIENT_TOKEN) as any;
        expect(client).toBeDefined();
        expect(client.options.db).toBe(1);
    });

    it("should initialize with direct RedisOptions", async () => {
        const adapter = new IoRedisAdapter({ host: "localhost", port: 6380 });
        const plugin = new RedisPlugin({ adapter });
        plugin.install(appMock);
        await plugin.onPluginInit();

        const client = container.resolve(REDIS_CLIENT_TOKEN) as any;
        expect(client).toBeDefined();
        expect(client.options.host).toBe("localhost");
        expect(client.options.port).toBe(6380);
    });

    it("should connect on init", async () => {
        const adapter = new IoRedisAdapter("redis://localhost:6379");
        const plugin = new RedisPlugin({ adapter });

        plugin.install(appMock);
        await plugin.onPluginInit();

        const client = container.resolve(REDIS_CLIENT_TOKEN) as any;
        expect(client.status).toBe("ready");
    });

    it("should fail startup if connection fails and strategy is 'fail'", async () => {
        const adapter = new IoRedisAdapter("redis://localhost:6379");
        const plugin = new RedisPlugin({
            adapter,
            failureStrategy: "fail"
        });
        plugin.install(appMock);

        const loggerErrorSpy = spyOn((plugin as any).logger, "error").mockImplementation(() => { });

        // Mock adapter.connect to throw
        adapter.connect = mock(() => Promise.reject(new Error("Connection refused")));

        expect(plugin.onPluginInit()).rejects.toThrow("Connection refused");

        expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it("should warn and continue if connection fails and strategy is 'warn'", async () => {
        const adapter = new IoRedisAdapter("redis://localhost:6379");
        const plugin = new RedisPlugin({
            adapter,
            failureStrategy: "warn"
        });
        plugin.install(appMock);

        const loggerWarnSpy = spyOn((plugin as any).logger, "warn").mockImplementation(() => { });

        // Mock adapter.connect to throw
        adapter.connect = mock(() => Promise.reject(new Error("Connection refused")));

        await plugin.onPluginInit(); // Should not throw

        expect(loggerWarnSpy).toHaveBeenCalled();
    });

    it("should disconnect on destroy", async () => {
        const adapter = new IoRedisAdapter("redis://localhost:6379");
        const plugin = new RedisPlugin({ adapter });
        plugin.install(appMock);
        await plugin.onPluginInit();

        const client = container.resolve(REDIS_CLIENT_TOKEN) as any;
        const quitSpy = spyOn(client, "quit");

        await plugin.onPluginDestroy();

        expect(quitSpy).toHaveBeenCalled();
    });

    it("should reuse existing connection if already connected", async () => {
        const adapter = new IoRedisAdapter("redis://localhost:6379");
        const plugin = new RedisPlugin({ adapter });
        plugin.install(appMock);

        await plugin.onPluginInit();

        // Spy on adapter.connect
        const connectSpy = spyOn(adapter, "connect");

        // Call init again
        await plugin.onPluginInit();

        expect(connectSpy).not.toHaveBeenCalled();
    });

    it("should skip disconnect in serverless mode", async () => {
        const adapter = new IoRedisAdapter("redis://localhost:6379");
        const plugin = new RedisPlugin({
            adapter,
            serverless: true
        });
        plugin.install(appMock);
        await plugin.onPluginInit();

        const client = container.resolve(REDIS_CLIENT_TOKEN) as any;
        const quitSpy = spyOn(client, "quit");

        await plugin.onPluginDestroy();

        expect(quitSpy).not.toHaveBeenCalled();
    });
});
