import { describe, it, expect, beforeEach } from "bun:test";
import { AuthGuard } from "../src/auth.guard";
import { PassportStrategy } from "../src/passport.strategy";
import { User } from "../src/decorators";
import { StrategyRegistry } from "../src/strategy.registry";
import { container } from "@project-karin/core";

// Mock Strategy
class MockStrategy extends PassportStrategy {
    constructor() {
        super("mock");
    }

    async authenticate(context: any) {
        const req = context.switchToHttp().getRequest();
        const token = req.headers.authorization;
        if (token === "valid-token") {
            return this.validate({ id: 1, name: "Test User" });
        }
        return null;
    }

    async validate(payload: any) {
        return payload;
    }
}

describe("Auth Module", () => {
    beforeEach(() => {
        // Clear registry
        (StrategyRegistry as any).strategies.clear();
    });

    it("should register a strategy", () => {
        const strategy = new MockStrategy();
        expect(StrategyRegistry.get("mock")).toBe(strategy);
    });

    it("should authenticate successfully with valid token", async () => {
        new MockStrategy();
        const Guard = AuthGuard("mock");
        const guard = new Guard();

        const req: any = {
            headers: { authorization: "valid-token" },
            user: null
        };

        const mockHandler = () => { };
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => req
            }),
            getHandler: () => mockHandler
        } as any;

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
        expect(req.user).toEqual({ id: 1, name: "Test User" });
    });

    it("should throw UnauthorizedException with invalid token", async () => {
        new MockStrategy();
        const Guard = AuthGuard("mock");
        const guard = new Guard();

        const mockHandler = () => { };
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { authorization: "invalid-token" }
                })
            }),
            getHandler: () => mockHandler
        } as any;

        let error;
        try {
            await guard.canActivate(mockContext);
        } catch (e) {
            error = e;
        }
        expect(error).toBeDefined();
        // Check status code since name is generic Error
        expect((error as any).status).toBe(401);
    });

    it("should allow access to public routes without authentication", async () => {
        new MockStrategy();
        const Guard = AuthGuard("mock");
        const guard = new Guard();

        const mockHandler = () => { };
        const mockContext = {
            getHandler: () => mockHandler,
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {}
                })
            })
        } as any;

        // Mock metadata
        Reflect.defineMetadata("isPublic", true, mockHandler);

        const result = await guard.canActivate(mockContext);
        expect(result).toBe(true);
    });
});
