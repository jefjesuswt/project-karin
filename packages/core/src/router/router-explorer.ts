import "reflect-metadata";
import { Logger } from "../logger";
import { KarinApplication } from "../karin.application";
import { MetadataScanner, type RouteDefinition } from "./metadata-scanner";
import { isExceptionFilter, isConstructor } from "../utils/type-guards";
import type { IHttpAdapter, ExceptionFilter, Type } from "../interfaces";
import pc from "picocolors";
import { RouteHandlerFactory } from "./router-handler-factory";
import { MetadataCache } from "./metadata-cache";
import { DICache } from "./di-cache";

export class RouterExplorer {
  private logger = new Logger("RouterExplorer");
  private scanner = new MetadataScanner();
  private handlerFactory: RouteHandlerFactory;

  constructor(private readonly adapter: IHttpAdapter) {
    this.handlerFactory = new RouteHandlerFactory(adapter);
  }

  public explore(app: KarinApplication, ControllerClass: Type<any>) {
    // 1. Resolve controller instance (Singleton)
    DICache.resolve(ControllerClass);

    app.registerController(ControllerClass);

    // 2. Scan for @Get, @Post, etc. metadata
    const routes = this.scanner.scan(ControllerClass);

    for (const route of routes) {
      this.registerRoute(app, ControllerClass, route);
    }
  }

  private registerRoute(
    app: KarinApplication,
    ControllerClass: Type<any>,
    route: RouteDefinition
  ) {
    const { httpMethod, fullPath, methodName } = route;
    // Safe cast because we know httpMethod corresponds to adapter methods
    const adapterMethod = (this.adapter as any)[httpMethod.toLowerCase()];

    if (adapterMethod) {
      // 3. Resolve all dependencies (Guards, Pipes, Interceptors, Filters)
      const deps = this.resolveDependencies(app, route);

      // 4. Compile and cache metadata for performance
      const compiled = MetadataCache.compile(ControllerClass, methodName, {
        guards: deps.guards,
        pipes: deps.pipes,
        interceptors: deps.interceptors,
        filters: deps.filters,
        params: route.params,
        isFast: route.isFast,
      });

      // 5. Create the final request handler
      const handler = this.handlerFactory.create(
        app,
        ControllerClass,
        methodName,
        compiled
      );

      // 6. Register with the underlying HTTP adapter (e.g. Hono, H3)
      adapterMethod.call(this.adapter, fullPath, handler);

      this.logRoute(httpMethod, fullPath, ControllerClass.name, route.isFast);
    }
  }

  private resolveDependencies(app: KarinApplication, route: RouteDefinition) {
    const resolve = (items: Array<Type<any> | any>) =>
      items.map((item) => (isConstructor(item) ? DICache.resolve(item) : item));

    // Merge global and route-specific dependencies
    const guards = resolve([...app.getGlobalGuards(), ...route.guards]);

    const pipes = resolve([...app.getGlobalPipes(), ...route.pipes]);

    const interceptors = resolve(route.interceptors);

    const filters = resolve([
      ...route.filters,
      ...app.getGlobalFilters(),
    ]).filter((f) => isExceptionFilter(f)) as ExceptionFilter[];

    return { guards, pipes, interceptors, filters };
  }

  private logRoute(
    method: string,
    path: string,
    controllerName: string,
    isFast: boolean
  ) {
    const methodColor = this.getMethodColor(method);
    const coloredMethod = pc.bold(methodColor(method.padEnd(7)));
    const routeInfo = path.padEnd(4);
    const separator = pc.dim("::");
    const controllerInfo = pc.cyan(controllerName);

    const fastIndicator = isFast ? pc.yellow(" ⚡FAST") : "";

    this.logger.log(
      `${coloredMethod} ${routeInfo} ${separator} ${controllerInfo}${fastIndicator}`
    );
  }

  private getMethodColor(method: string) {
    switch (method) {
      case "GET":
        return pc.green;
      case "POST":
        return pc.yellow;
      case "PUT":
        return pc.blue;
      case "DELETE":
        return pc.red;
      case "PATCH":
        return pc.magenta;
      default:
        return pc.white;
    }
  }
}