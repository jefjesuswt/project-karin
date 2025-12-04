import {
    type CanActivate,
    type ExecutionContext,
    UnauthorizedException,
    injectable
} from "@karin-js/core";
import { StrategyRegistry } from "./strategy.registry";

import { IS_PUBLIC_KEY } from "./public.decorator";

export function AuthGuard(strategyName: string) {
    @injectable()
    class MixinAuthGuard implements CanActivate {
        async canActivate(context: ExecutionContext): Promise<boolean> {
            const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, context.getHandler());
            if (isPublic) {
                return true;
            }

            const strategy = StrategyRegistry.get(strategyName);
            if (!strategy) {
                throw new Error(`Auth strategy '${strategyName}' not found.`);
            }

            const user = await strategy.authenticate(context);
            if (!user) {
                throw new UnauthorizedException();
            }

            // Attach user to request
            const req = context.switchToHttp().getRequest();
            req.user = user;

            return true;
        }
    }

    return MixinAuthGuard;
}
