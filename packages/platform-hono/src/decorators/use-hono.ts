import { UseInterceptors, type CallHandler, type ExecutionContext, type KarinInterceptor } from "@project-karin/core";
import type { Context, Next } from "hono";

class HonoMiddlewareWrapper implements KarinInterceptor {
    constructor(private readonly middleware: (c: Context, next: Next) => Promise<void | Response>) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
        const honoCtx = context.getPlatformContext<Context>();

        await this.middleware(honoCtx, async () => {
            const result = await next.handle();

            if (result instanceof Response) {
                honoCtx.res = result;
            } else if (result === null || result === undefined) {
                honoCtx.res = new Response(null, { status: 204 });
            } else if (typeof result === "object") {
                honoCtx.res = honoCtx.json(result);
            } else {
                honoCtx.res = honoCtx.text(String(result));
            }
        });

        return honoCtx.res;
    }
}
export function UseHono(middleware: (c: Context, next: Next) => Promise<void | Response>) {
    return UseInterceptors(new HonoMiddlewareWrapper(middleware));
}
