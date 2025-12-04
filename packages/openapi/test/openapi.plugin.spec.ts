import "reflect-metadata";
import { describe, it, expect, beforeEach, afterEach, spyOn, mock } from "bun:test";
import { OpenApiPlugin } from "../src/openapi.plugin";
import { Controller, Get } from "@karin-js/core";

@Controller("test")
class TestController {
    @Get()
    index() { }
}

describe("OpenApiPlugin", () => {
    let appMock: any;
    let adapterMock: any;
    let logSpy: any;
    let warnSpy: any;

    beforeEach(() => {
        adapterMock = {
            get: mock(() => { }),
        };

        appMock = {
            getControllers: () => [TestController],
            getHttpAdapter: () => adapterMock,
        };

        logSpy = spyOn(console, "log").mockImplementation(() => { });
        warnSpy = spyOn(console, "warn").mockImplementation(() => { });
    });

    afterEach(() => {
        logSpy.mockRestore();
        warnSpy.mockRestore();
    });

    it("should be defined", () => {
        const plugin = new OpenApiPlugin();
        expect(plugin).toBeDefined();
    });

    it("should register routes on init", async () => {
        const plugin = new OpenApiPlugin({ path: "/api-docs" });
        plugin.install(appMock);
        await plugin.onPluginInit();

        expect(adapterMock.get).toHaveBeenCalledTimes(2);
        expect(adapterMock.get).toHaveBeenCalledWith("/api-docs/json", expect.any(Function));
        expect(adapterMock.get).toHaveBeenCalledWith("/api-docs", expect.any(Function));

        expect(logSpy).toHaveBeenCalled();
    });

    it("should warn if no controllers found", async () => {
        appMock.getControllers = () => [];

        const plugin = new OpenApiPlugin();
        plugin.install(appMock);
        await plugin.onPluginInit();

        expect(logSpy).toHaveBeenCalled();
        const calls = logSpy.mock.calls.map((c: any) => c[0]).join(" ");
        expect(calls).toContain("WARN");
        expect(calls).toContain("No controllers found");
    });

    it("should customize title and version", async () => {
        const plugin = new OpenApiPlugin({ title: "Custom API", version: "2.0.0" });
        plugin.install(appMock);
        await plugin.onPluginInit();

        const jsonHandler = adapterMock.get.mock.calls[0][1];
        const doc = jsonHandler();

        expect(doc.info.title).toBe("Custom API");
        expect(doc.info.version).toBe("2.0.0");
    });
});
