import { KarinExecutionContext } from "../context/execution-context";
import { ForbiddenException } from "../exceptions/http.exception";
import { BaseExceptionFilter } from "../exceptions/base-exception.filter";
import type {
  IHttpAdapter,
  CallHandler,
  Type,
  KarinInterceptor,
} from "../interfaces";
import { ParamsResolver } from "./param-resolver";
import { KarinApplication } from "../karin.application";
import type { CompiledRouteMetadata, ResolvedFilter } from "./metadata-cache";

export class RouteHandlerFactory {
  private paramsResolver = new ParamsResolver();
  private defaultFilter = new BaseExceptionFilter();

  constructor(private readonly adapter: IHttpAdapter) { }

  public create(
    app: KarinApplication,
    ControllerClass: Type<any>,
    methodName: string,
    compiled: CompiledRouteMetadata
  ) {
    if (compiled.isFast) {
      return this.createFastHandler(app, compiled);
    }

    return this.createOptimizedHandler(app, ControllerClass, methodName, compiled);
  }


  private createFastHandler(
    _app: KarinApplication,
    compiled: CompiledRouteMetadata
  ) {
    const { boundHandler } = compiled;
    return () => boundHandler();
  }

  private createOptimizedHandler(
    _app: KarinApplication,
    ControllerClass: Type<any>,
    methodName: string,
    compiled: CompiledRouteMetadata
  ) {
    const { boundHandler, guards, pipes, interceptors, filters, params } = compiled;

    const hasGuards = guards.length > 0;
    const hasPipes = pipes.length > 0;
    const hasParams = params.length > 0;
    const hasInterceptors = interceptors.length > 0;
    const hasFilters = filters.length > 0;

    if (!hasGuards && !hasPipes && !hasParams && !hasInterceptors) {
      return async (ctx: unknown) => {
        try {
          return await boundHandler();
        } catch (error: any) {
          if (!hasFilters) {
            return this.defaultFilter.catch(error, this.createBasicHost(ctx));
          }
          return this.handleException(error, ctx, filters, ControllerClass.prototype[methodName]);
        }
      };
    }

    return async (ctx: unknown) => {
      try {
        let executionContext: KarinExecutionContext | undefined;

        if (hasGuards || hasParams || hasInterceptors) {
          executionContext = new KarinExecutionContext(
            this.adapter,
            ctx,
            ControllerClass,
            boundHandler
          );
        }

        // Guards
        if (hasGuards) {
          for (const guard of guards) {
            const canActivate = await guard.canActivate(executionContext!);
            if (!canActivate) {
              throw new ForbiddenException("Forbidden resource");
            }
          }
        }

        // Params
        let args: unknown[] = [];
        if (hasParams) {
          args = await this.paramsResolver.resolve(
            ctx,
            params,
            pipes,
            this.adapter,
            executionContext!
          );
        }

        // Interceptors
        if (hasInterceptors) {
          // executionContext is guaranteed to be created above

          const baseHandler: CallHandler = {
            handle: async () => boundHandler(...args),
          };

          const executionChain = await this.composeInterceptors(
            interceptors,
            baseHandler,
            executionContext!
          );

          return await executionChain.handle();
        }

        return await boundHandler(...args);
      } catch (error: any) {
        if (!hasFilters) {
          return this.defaultFilter.catch(error, this.createBasicHost(ctx));
        }
        return this.handleException(
          error,
          ctx,
          filters,
          ControllerClass.prototype[methodName]
        );
      }
    };
  }



  private async handleException(
    exception: unknown,
    ctx: unknown,
    resolvedFilters: ResolvedFilter[],
    method: Function
  ) {
    for (const filterData of resolvedFilters) {
      const { instance, catchMetatypes } = filterData;

      const handlesException =
        catchMetatypes.length === 0 ||
        catchMetatypes.some((meta: any) => exception instanceof meta);

      if (handlesException) {
        const host = new KarinExecutionContext(
          this.adapter,
          ctx,
          null as any,
          method
        ).switchToHttp();

        return instance.catch(exception, host);
      }
    }

    const host = new KarinExecutionContext(
      this.adapter,
      ctx,
      null as any,
      method
    ).switchToHttp();

    return this.defaultFilter.catch(exception, host);
  }

  private async composeInterceptors(
    interceptors: KarinInterceptor[],
    handler: CallHandler,
    context: KarinExecutionContext
  ): Promise<CallHandler> {
    let next = handler;

    for (let i = interceptors.length - 1; i >= 0; i--) {
      const currentInterceptor = interceptors[i];
      if (!currentInterceptor) continue;

      const currentNext = next;

      next = {
        handle: async () => {
          return currentInterceptor.intercept(context, currentNext);
        },
      };
    }
    return next;
  }

  private createBasicHost(ctx: unknown) {
    return {
      switchToHttp: () => ({
        getRequest: () => this.adapter.getRequest(ctx),
        getResponse: () => this.adapter.getResponse(ctx),
      }),
    } as any;
  }
}