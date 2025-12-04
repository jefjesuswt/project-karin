import { describe, it, expect, mock } from "bun:test";
import { OAuth2Strategy } from "../src/oauth2.strategy";
import { RedirectException } from "@project-karin/core";

class TestOAuth2Strategy extends OAuth2Strategy {
    constructor() {
        super("test-oauth", {
            authorizationURL: "https://provider.com/auth",
            tokenURL: "https://provider.com/token",
            clientID: "client-id",
            clientSecret: "client-secret",
            callbackURL: "http://localhost:3000/callback",
            scope: ["profile", "email"]
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        return { id: "user-1", accessToken };
    }
}

describe("OAuth2Strategy", () => {
    it("should redirect if no code is present", async () => {
        const strategy = new TestOAuth2Strategy();
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    url: "http://localhost:3000/auth/login"
                })
            })
        } as any;

        let error: any;
        try {
            await strategy.authenticate(mockContext);
        } catch (e) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error instanceof RedirectException).toBe(true);
        expect(error.url).toContain("https://provider.com/auth");
        expect(error.url).toContain("client_id=client-id");
        expect(error.url).toContain("redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback");
    });

    it("should exchange code for token", async () => {
        const originalFetch = global.fetch;
        try {
            const strategy = new TestOAuth2Strategy();
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        url: "http://localhost:3000/callback?code=test-code"
                    })
                })
            } as any;

            // Mock fetch
            global.fetch = mock(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ access_token: "mock-access-token", refresh_token: "mock-refresh" })
            } as any)) as any;

            const user = await strategy.authenticate(mockContext);

            expect(user).toEqual({ id: "user-1", accessToken: "mock-access-token" });
            expect(fetch).toHaveBeenCalled();
        } finally {
            global.fetch = originalFetch;
        }
    });
});
