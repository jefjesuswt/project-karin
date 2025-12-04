import { describe, it, expect } from "bun:test";
import { JwtService, JWT_OPTIONS } from "../src/jwt/jwt.service";
import "reflect-metadata";

describe("JwtService", () => {
    // Manually inject options for unit testing
    const service = new JwtService({ secret: "test-secret", signOptions: { expiresIn: "1h" } });

    it("should sign and verify a token", async () => {
        const payload = { sub: "123", username: "test" };
        const token = await service.sign(payload);

        expect(token).toBeDefined();
        expect(typeof token).toBe("string");

        const decoded = await service.verify(token);
        expect(decoded.sub).toBe("123");
        expect(decoded.username).toBe("test");
    });

    it("should throw error for invalid token", async () => {
        // We expect the promise to reject
        expect(service.verify("invalid-token")).rejects.toThrow();
    });
});
