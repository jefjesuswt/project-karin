export interface IHttpAdapter<
  TContext = any,
  TRequest = Request,
  TResponse = any
> {
  get(path: string, handler: (ctx: TContext) => void): void;
  post(path: string, handler: (ctx: TContext) => void): void;
  put(path: string, handler: (ctx: TContext) => void): void;
  delete(path: string, handler: (ctx: TContext) => void): void;
  patch(path: string, handler: (ctx: TContext) => void): void;

  enableCors?(options?: any): void;

  listen(port: number, host?: string): any;
  close?(): void | Promise<void>;

  readBody<T = any>(ctx: TContext): Promise<T | undefined>;
  getQuery<T = Record<string, any>>(ctx: TContext): T;
  getParams<T = Record<string, any>>(ctx: TContext): T;
  getHeaders<T = Record<string, any>>(ctx: TContext): T;

  getRequest(ctx: TContext): TRequest;
  getResponse(ctx: TContext): TResponse;

  setHeader(ctx: TContext, key: string, value: string): void;
}
