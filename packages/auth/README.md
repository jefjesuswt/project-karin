# @karin-js/auth

A robust authentication module for the **Karin** framework, inspired by Passport.js and NestJS Auth. It provides a flexible strategy-based authentication system, supporting JWT, Local, OAuth2, and more.
js but optimized for modern TypeScript environments.

## Features

- **Strategy Pattern**: Easily extensible authentication strategies (Local, JWT, OAuth2, etc.).
- **Decorators**: `@UseGuards(AuthGuard('strategy'))` for protecting routes.
- **Karin Integration**: Seamlessly integrates with Karin's dependency injection and guard system.
- **Type-Safe**: Built with TypeScript for full type support.
- **JWT Support**: Built-in utilities for signing and verifying JSON Web Tokens.

## Installation

```bash
bun add @karin-js/auth
```

## JWT Authentication

### 1. Register the Plugin

```typescript
import { KarinFactory } from "@karin-js/core";
import { JwtPlugin } from "@karin-js/auth";

const app = await KarinFactory.create(adapter, {
  plugins: [
    new JwtPlugin({
      secret: "super-secret-key",
      signOptions: { expiresIn: "1h" },
    }),
  ],
});
```

### 2. Create a Strategy

Implement a strategy to validate the token.

```typescript
import { PassportStrategy } from "@karin-js/auth";
import { UnauthorizedException } from "@karin-js/core";
import { JwtService } from "@karin-js/auth";

@Service()
export class JwtStrategy extends PassportStrategy {
  constructor(private jwtService: JwtService) {
    super("jwt"); // The name of this strategy
  }

  async authenticate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader?.startsWith("Bearer ")) return null;
    
    const token = authHeader.split(" ")[1];
    try {
      // Verify token using the injected JwtService (now async!)
      const payload = await this.jwtService.verify(token);
      // Return the user object (or whatever you want attached to req.user)
      return { id: payload.sub, email: payload.email };
    } catch {
      return null; // Authentication failed
    }
  }
}
```

### 3. Protect Routes

Use the `AuthGuard` to protect your controllers or methods.

```typescript
import { Controller, Get, UseGuards } from "@karin-js/core";
import { AuthGuard } from "@karin-js/auth";

@Controller("/profile")
@UseGuards(AuthGuard("jwt"))
export class ProfileController {
  @Get()
  getProfile(@Req() req) {
    return req.user;
  }
}
```

## OAuth2 Authentication

Extend the `OAuth2Strategy` to implement providers.

```typescript
import { OAuth2Strategy } from "@karin-js/auth";

export class GoogleStrategy extends OAuth2Strategy {
  constructor() {
    super("google", {
      authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenURL: "https://oauth2.googleapis.com/token",
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Find or create user in DB
    return { email: profile.email };
  }
}
```

## Public Routes

You can mark specific routes as public to bypass global guards.

```typescript
import { Public } from "@karin-js/auth";

@Controller("/auth")
export class AuthController {
  @Post("/login")
  @Public()
  login() {
    // ...
  }
}
```

## License

MIT
