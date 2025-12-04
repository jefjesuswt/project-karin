import { describe, it, expect, beforeEach, afterEach, spyOn, mock } from "bun:test";
import { GeneratorService } from "../src/services/generator.service";
import * as fs from "fs";
import * as path from "path";

mock.module("@clack/prompts", () => {
    return {
        spinner: () => ({
            start: mock(() => { }),
            stop: mock(() => { }),
            message: mock(() => { }),
        }),
        note: mock(() => { }),
        confirm: mock(() => Promise.resolve(true)),
        isCancel: mock(() => false),
        cancel: mock(() => { }),
    };
});

mock.module("../src/utils/paths", () => {
    return {
        findSrcDir: (cwd: string) => path.join(cwd, "src"),
    };
});

describe("GeneratorService", () => {
    const cwd = "/test/project";
    let service: GeneratorService;
    let existsSyncSpy: any;
    let mkdirSyncSpy: any;
    let writeFileSyncSpy: any;
    let logSpy: any;

    beforeEach(() => {
        service = new GeneratorService(cwd, false);

        existsSyncSpy = spyOn(fs, "existsSync").mockReturnValue(false);
        mkdirSyncSpy = spyOn(fs, "mkdirSync").mockImplementation(() => undefined);
        writeFileSyncSpy = spyOn(fs, "writeFileSync").mockImplementation(() => undefined);
        logSpy = spyOn(console, "log").mockImplementation(() => { });
    });

    afterEach(() => {
        existsSyncSpy.mockRestore();
        mkdirSyncSpy.mockRestore();
        writeFileSyncSpy.mockRestore();
        logSpy.mockRestore();
    });

    it("should generate a controller", async () => {
        await service.generate("controller", "users");

        const expectedPath = path.join(cwd, "src/users/users.controller.ts");
        expect(mkdirSyncSpy).toHaveBeenCalledWith(path.join(cwd, "src/users"), { recursive: true });
        expect(writeFileSyncSpy).toHaveBeenCalledWith(expectedPath, expect.any(String));
    });

    it("should generate a service", async () => {
        await service.generate("service", "users");

        const expectedPath = path.join(cwd, "src/users/users.service.ts");
        expect(writeFileSyncSpy).toHaveBeenCalledWith(expectedPath, expect.any(String));
    });

    it("should handle dry-run", async () => {
        service = new GeneratorService(cwd, true);
        await service.generate("controller", "users");

        expect(writeFileSyncSpy).not.toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalled();
    });

    it("should skip if file exists", async () => {
        existsSyncSpy.mockImplementation((p: string) => p.endsWith(".ts"));

        await service.generate("controller", "users");

        expect(writeFileSyncSpy).not.toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalled();
    });

    it("should generate resource (CRUD)", async () => {
        await service.generate("resource", "products");

        expect(writeFileSyncSpy).toHaveBeenCalledTimes(5);

        const calls = writeFileSyncSpy.mock.calls.map((c: any) => c[0]);
        expect(calls.some((p: string) => p.endsWith("products.controller.ts"))).toBe(true);
        expect(calls.some((p: string) => p.endsWith("products.service.ts"))).toBe(true);
        expect(calls.some((p: string) => p.endsWith("product.entity.ts"))).toBe(true);
        expect(calls.some((p: string) => p.endsWith("create-product.dto.ts"))).toBe(true);
        expect(calls.some((p: string) => p.endsWith("update-product.dto.ts"))).toBe(true);
    });
});
