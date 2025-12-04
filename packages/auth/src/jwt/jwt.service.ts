import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { inject, Service } from "@karin-js/core";

export const JWT_OPTIONS = "JWT_OPTIONS";

export interface JwtSignOptions {
    expiresIn?: string | number;
    issuer?: string;
    audience?: string | string[];
    subject?: string;
}

export interface JwtVerifyOptions {
    issuer?: string | string[];
    audience?: string | string[];
}

export interface JwtModuleOptions {
    secret: string;
    signOptions?: JwtSignOptions;
    alg?: string; // Default: HS256
}

@Service()
export class JwtService {
    private secret: Uint8Array;
    private alg: string;

    constructor(@inject(JWT_OPTIONS) private readonly options: JwtModuleOptions) {
        this.secret = new TextEncoder().encode(options.secret);
        this.alg = options.alg || "HS256";
    }

    async sign(payload: JWTPayload, options?: JwtSignOptions): Promise<string> {
        const finalOptions = { ...this.options.signOptions, ...options };

        const jwt = new SignJWT(payload)
            .setProtectedHeader({ alg: this.alg })
            .setIssuedAt();

        if (finalOptions.issuer) jwt.setIssuer(finalOptions.issuer);
        if (finalOptions.audience) jwt.setAudience(finalOptions.audience);
        if (finalOptions.subject) jwt.setSubject(finalOptions.subject);
        if (finalOptions.expiresIn) jwt.setExpirationTime(finalOptions.expiresIn);

        return await jwt.sign(this.secret);
    }

    async verify<T = JWTPayload>(token: string, options?: JwtVerifyOptions): Promise<T> {
        const { payload } = await jwtVerify(token, this.secret, {
            issuer: options?.issuer,
            audience: options?.audience,
        });
        return payload as T;
    }
}
