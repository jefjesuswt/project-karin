import type {
  ExecutionContext,
  HttpArgumentsHost,
  IHttpAdapter,
  Type,
} from "../interfaces";

export class KarinExecutionContext implements ExecutionContext {
  constructor(
    private readonly adapter: IHttpAdapter,
    private readonly platformContext: unknown,
    private readonly controllerClass: Type<unknown>,
    private readonly handler: Function
  ) { }

  getClass<T = any>(): Type<T> {
    return this.controllerClass as Type<T>;
  }

  getHandler(): Function {
    return this.handler;
  }

  getParams<T = any>(): T {
    return this.adapter.getParams(this.platformContext) as T;
  }

  getRequest<T = any>(): T {
    return this.adapter.getRequest(this.platformContext) as T;
  }

  getResponse<T = any>(): T {
    return this.adapter.getResponse(this.platformContext) as T;
  }

  getNext<T = any>(): T {
    return null as T;
  }

  switchToHttp(): HttpArgumentsHost {
    return this;
  }

  getPlatformContext<T = any>(): T {
    return this.platformContext as T;
  }
}
