import { PassportStrategy } from "./passport.strategy";
import type { ExecutionContext } from "@project-karin/core";
import { RedirectException } from "@project-karin/core";

export interface OAuth2StrategyOptions {
    authorizationURL: string;
    tokenURL: string;
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    scopeSeparator?: string;
}

export abstract class OAuth2Strategy extends PassportStrategy {
    constructor(name: string, private readonly options: OAuth2StrategyOptions) {
        super(name);
    }

    async authenticate(context: ExecutionContext): Promise<any> {
        const req = context.switchToHttp().getRequest();
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
            throw new Error(`OAuth2 Error: ${error}`);
        }

        if (!code) {
            // Step 1: Redirect to Provider
            const params = new URLSearchParams({
                response_type: "code",
                client_id: this.options.clientID,
                redirect_uri: this.options.callbackURL,
            });

            if (this.options.scope) {
                const separator = this.options.scopeSeparator || " ";
                params.append("scope", this.options.scope.join(separator));
            }

            const redirectUrl = `${this.options.authorizationURL}?${params.toString()}`;
            throw new RedirectException(redirectUrl);
        }

        // Step 2: Exchange Code for Token
        const tokenResponse = await this.getOAuthAccessToken(code);

        // Step 3: Validate/Fetch Profile (User implemented)
        const user = await this.validate(tokenResponse.access_token, tokenResponse.refresh_token, tokenResponse);
        return user;
    }

    private async getOAuthAccessToken(code: string): Promise<any> {
        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: this.options.clientID,
            client_secret: this.options.clientSecret,
            redirect_uri: this.options.callbackURL,
        });

        const response = await fetch(this.options.tokenURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Failed to exchange token: ${response.status} ${text}`);
        }

        return await response.json();
    }


    abstract validate(accessToken: string, refreshToken: string, profile: any): Promise<any>;
}
