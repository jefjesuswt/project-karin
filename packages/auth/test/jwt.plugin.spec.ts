import { describe, it, expect, beforeEach } from "bun:test";
import { JwtPlugin } from "../src/jwt/jwt.plugin";
import { JwtService, JWT_OPTIONS } from "../src/jwt/jwt.service";
import { container } from "@karin-js/core";

describe("JwtPlugin", () => {
    beforeEach(() => {
        container.clearInstances();
    });

    it("should register JwtService and options", () => {
        const options = { secret: "plugin-secret" };
        const plugin = new JwtPlugin(options);
        const appMock = {} as any;

        plugin.install(appMock);

        const registeredOptions = container.resolve(JWT_OPTIONS);
        expect(registeredOptions).toEqual(options);

        const service = container.resolve(JwtService);
        expect(service).toBeDefined();
        expect(service instanceof JwtService).toBe(true);
    });
});
