import "reflect-metadata";
import { describe, it, expect, spyOn, beforeEach, afterEach, mock } from "bun:test";
import { KarinFactory } from "../src/karin.factory";

// Mock IHttpAdapter
const mockAdapter = {
    fetch: () => new Response("ok"),
    listen: () => { },
    use: () => { },
    getHttpServer: () => { },
    close: () => { },
    init: () => { },
} as any;

describe("KarinFactory.serverless", () => {
    let originalProcessEnv: any;
    let createSpy: any;
    let appMock: any;

    beforeEach(() => {
        originalProcessEnv = { ...process.env };

        appMock = {
            init: mock(() => Promise.resolve()),
            getHttpAdapter: () => mockAdapter,
        };

        createSpy = spyOn(KarinFactory, "create").mockResolvedValue(appMock);
    });

    afterEach(() => {
        process.env = originalProcessEnv;
        createSpy.mockRestore();
    });

    it("should return an object with a fetch method", () => {
        const handler = KarinFactory.serverless(mockAdapter);
        expect(handler).toHaveProperty("fetch");
        expect(typeof handler.fetch).toBe("function");
    });

    it("should initialize app on first fetch (Warm Start)", async () => {
        const handler = KarinFactory.serverless(mockAdapter);
        const req = new Request("http://localhost/");

        await handler.fetch(req);

        expect(createSpy).toHaveBeenCalled();
        expect(appMock.init).toHaveBeenCalled();
    });

    it("should reuse app on subsequent fetches", async () => {
        const handler = KarinFactory.serverless(mockAdapter);
        const req = new Request("http://localhost/");

        await handler.fetch(req);
        await handler.fetch(req);

        expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it("should hydrate process.env from env argument (Cloudflare/Vercel Edge)", async () => {
        const handler = KarinFactory.serverless(mockAdapter);
        const req = new Request("http://localhost/");
        const env = { MY_VAR: "test-value" };

        await handler.fetch(req, env);

        expect(process.env.MY_VAR).toBe("test-value");
    });

    it("should force scan: false in serverless mode", async () => {
        const handler = KarinFactory.serverless(mockAdapter, { scan: true } as any);
        const req = new Request("http://localhost/");

        await handler.fetch(req);

        const calledOptions = createSpy.mock.calls[0][1];
        expect(calledOptions.scan).toBe(false);
    });
});
