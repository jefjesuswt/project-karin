export { type IAuthStrategy, type AuthModuleOptions } from "./src/interfaces";
export { AuthGuard } from "./src/auth.guard";
export { PassportStrategy } from "./src/passport.strategy";
export { StrategyRegistry } from "./src/strategy.registry";
export { User } from "./src/decorators";
export { JwtService, JWT_OPTIONS, type JwtSignOptions, type JwtVerifyOptions, type JwtModuleOptions } from "./src/jwt/jwt.service";
export { JwtPlugin } from "./src/jwt/jwt.plugin";
export { Public, IS_PUBLIC_KEY } from "./src/public.decorator";
export { OAuth2Strategy, type OAuth2StrategyOptions } from "./src/oauth2.strategy";
