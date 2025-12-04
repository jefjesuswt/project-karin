import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { ConfigPlugin } from "../src/config.plugin";
import { ConfigService } from "../src/config.service";
import { container, type KarinApplication } from "@project-karin/core";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

describe("ConfigPlugin", () => {
    let appMock: KarinApplication;
    const tempEnvPath = path.join(process.cwd(), ".env.test");
    let logSpy: any;
    let warnSpy: any;
    let errorSpy: any;

    beforeEach(() => {
        appMock = {
            getRootPath: () => process.cwd(),
        } as any;

        if (fs.existsSync(tempEnvPath)) {
            fs.unlinkSync(tempEnvPath);
        }

        logSpy = spyOn(console, "log").mockImplementation(() => { });
        warnSpy = spyOn(console, "warn").mockImplementation(() => { });
        errorSpy = spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        if (fs.existsSync(tempEnvPath)) {
            fs.unlinkSync(tempEnvPath);
        }
        delete process.env.TEST_VAR;
        delete process.env.PORT;

        logSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it("should load configuration from custom load function", () => {
        const customConfig = { FOO: "bar" };
        const plugin = new ConfigPlugin<{ FOO: string }>({
            load: () => customConfig,
        });

        plugin.install(appMock);

        expect(plugin.get("FOO")).toBe("bar");

        // Verify service is registered in container
        const service = container.resolve<ConfigService<{ FOO: string }>>(ConfigService);
        expect(service).toBeDefined();
        expect(service.get("FOO")).toBe("bar");
    });

    it("should validate configuration with Zod schema", () => {
        const schema = z.object({
            PORT: z.string().transform(Number),
        });

        process.env.PORT = "8080";

        const plugin = new ConfigPlugin({
            schema,
        });

        plugin.install(appMock);
        expect(plugin.get("PORT")).toBe(8080);
    });

    it("should throw error if validation fails", () => {
        const schema = z.object({
            REQUIRED_VAR: z.string(),
        });

        const plugin = new ConfigPlugin({
            schema,
        });

        expect(() => plugin.install(appMock)).toThrow("Invalid Configuration");
    });

    it("should load from .env file if present", () => {
        fs.writeFileSync(tempEnvPath, "TEST_VAR=hello");

        const plugin = new ConfigPlugin({
            envFilePath: tempEnvPath
        });

        plugin.install(appMock);

        expect(process.env.TEST_VAR).toBe("hello");

        expect(plugin.get("TEST_VAR")).toBe("hello");
    });

    it("should warn if .env file is missing and required is true", () => {
        const plugin = new ConfigPlugin({
            envFilePath: "/non/existent/path/.env",
            required: true
        });

        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "development";

        plugin.install(appMock);

        const called = logSpy.mock.calls.length > 0 || warnSpy.mock.calls.length > 0;
        expect(called).toBe(true);

        process.env.NODE_ENV = originalNodeEnv;
    });

    it("should support the bootstrap pattern (integration simulation)", () => {
        process.env.PORT = "4000";
        process.env.DB_NAME = "test_db";

        const config = new ConfigPlugin({
            load: () => ({
                port: parseInt(process.env.PORT || "3000", 10),
                dbName: process.env.DB_NAME || "default_db",
            }),
        });

        // Simulate app.use(config)
        config.install(appMock);

        // Simulate usage in another plugin (e.g. MongoosePlugin)
        const mongooseOptions = {
            dbName: config.get("dbName"),
        };

        const serverPort = config.get("port");

        expect(mongooseOptions.dbName).toBe("test_db");
        expect(serverPort).toBe(4000);
    });

    it("should prioritize explicit 'env' option (Serverless/IoC)", () => {
        const explicitEnv = {
            API_KEY: "explicit-key",
            NODE_ENV: "serverless"
        };

        // Set process.env to ensure it's ignored
        process.env.API_KEY = "ignored-key";

        const plugin = new ConfigPlugin({
            env: explicitEnv
        });

        plugin.install(appMock);

        expect(plugin.get("API_KEY")).toBe("explicit-key");
        expect(plugin.get("NODE_ENV")).toBe("serverless");
    });
});
