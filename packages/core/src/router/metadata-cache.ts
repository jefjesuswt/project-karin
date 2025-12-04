import { Logger } from "../logger";
import type { RouteParamMetadata } from "../decorators/params";
import type {
  CanActivate,
  PipeTransform,
  KarinInterceptor,
  ExceptionFilter,
  Type,
} from "../interfaces";
import { isConstructor } from "../utils/type-guards";
import { DICache } from "./di-cache";
import { FILTER_CATCH_EXCEPTIONS } from "../decorators/constants";

export interface ResolvedFilter {
  instance: ExceptionFilter;
  catchMetatypes: any[];
}

export interface CompiledRouteMetadata<T = unknown> {
  controllerInstance: T;
  boundHandler: Function;
  guards: CanActivate[];
  pipes: PipeTransform[];
  interceptors: KarinInterceptor[];
  filters: ResolvedFilter[];
  params: ResolvedParamMetadata[];
  isFast: boolean;
}

export interface ResolvedParamMetadata extends RouteParamMetadata {
  resolvedPipes: PipeTransform[];
}

export class MetadataCache {
  private static cache = new Map<string, CompiledRouteMetadata>();
  private static logger = new Logger("MetadataCache");

  static compile(
    controllerClass: Type<any>,
    methodName: string,
    rawMetadata: {
      guards: (CanActivate | Type<CanActivate>)[];
      pipes: (PipeTransform | Type<PipeTransform>)[];
      interceptors: (KarinInterceptor | Type<KarinInterceptor>)[];
      filters: (ExceptionFilter | Type<ExceptionFilter>)[];
      params: RouteParamMetadata[];
      isFast: boolean;
    }
  ): CompiledRouteMetadata {
    const cacheKey = `${controllerClass.name}.${methodName}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Pre-resolve controller (Singleton)
    const controllerInstance = DICache.resolve(controllerClass) as any;
    const boundHandler =
      controllerInstance[methodName].bind(controllerInstance);

    // Pre-resolve guards, pipes, interceptors
    const guards = this.resolveInstances<CanActivate>(rawMetadata.guards);
    const pipes = this.resolveInstances<PipeTransform>(rawMetadata.pipes);
    const interceptors = this.resolveInstances<KarinInterceptor>(
      rawMetadata.interceptors
    );

    // Pre-resolve filters - metadata
    const filterInstances = this.resolveInstances<ExceptionFilter>(
      rawMetadata.filters
    );
    const filters: ResolvedFilter[] = filterInstances.map((instance) => {
      const constructor = Object.getPrototypeOf(instance).constructor;
      const catchMetatypes =
        Reflect.getMetadata(FILTER_CATCH_EXCEPTIONS, constructor) || [];
      return { instance, catchMetatypes };
    });


    this.sortFilters(filters);

    // Pre-resolve params pipes 
    const params: ResolvedParamMetadata[] = rawMetadata.params.map((param) => ({
      ...param,
      resolvedPipes: this.resolveInstances<PipeTransform>(param.pipes || []),
    }));

    const compiled: CompiledRouteMetadata = {
      controllerInstance,
      boundHandler,
      guards,
      pipes,
      interceptors,
      filters,
      params,
      isFast: rawMetadata.isFast,
    };

    this.cache.set(cacheKey, compiled);

    if (typeof process !== "undefined" && process.env?.DEBUG) {
      this.logger.debug(`Compiled metadata for ${cacheKey}`);
    }

    return compiled;
  }


  private static sortFilters(filters: ResolvedFilter[]) {
    // Sort filters: specific exception handlers first, catch-all last
    filters.sort((a, b) => {
      const isCatchAllA = a.catchMetatypes.length === 0;
      const isCatchAllB = b.catchMetatypes.length === 0;
      if (isCatchAllA && !isCatchAllB) return 1;
      if (!isCatchAllA && isCatchAllB) return -1;
      return 0;
    });
  }

  private static resolveInstances<T>(items: (Type<T> | T)[]): T[] {
    return items.map((item) =>
      isConstructor(item) ? DICache.resolve(item) : item
    ) as T[];
  }

  static get(
    controllerClass: Type<any>,
    methodName: string
  ): CompiledRouteMetadata {
    const cacheKey = `${controllerClass.name}.${methodName}`;
    const compiled = this.cache.get(cacheKey);

    if (!compiled) throw new Error(
      `No compiled metadata found for ${cacheKey}. 
        Possible solutions:
        1. Ensure the controller is registered in 'controllers' array or scanned via 'scan' option.
        2. If using manual registration, verify that KarinFactory.create() is called with the correct controllers.
        3. Check if the method '${methodName}' has valid decorators (@Get, @Post, etc.).`
    );

    return compiled;
  }

  static getStats() {
    return {
      size: this.cache.size,
      routes: Array.from(this.cache.keys()),
    };
  }

  static clear() {
    this.cache.clear();
  }
}
