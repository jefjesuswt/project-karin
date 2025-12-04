import "reflect-metadata";
import { describe, it, expect, mock } from "bun:test";
import { ParamsResolver } from "../../src/router/param-resolver";
import type { IHttpAdapter, ExecutionContext } from "../../src/interfaces";
import type { ResolvedParamMetadata } from "../../src/router/metadata-cache";

describe("ParamsResolver", () => {
  const resolver = new ParamsResolver();

  // 1. Mock del Adaptador
  const mockAdapter = {
    readBody: mock(async () => ({ name: "Karin" })),
    getQuery: mock(() => ({ page: "1" })),
    getParams: mock(() => ({ id: "123" })),
    getHeaders: mock(() => ({ "user-agent": "Bun" })),
    getRequest: mock(() => ({ headers: { get: () => "Bearer token" } })), // Mock para el custom decorator
    getResponse: mock(() => ({})),
  } as unknown as IHttpAdapter;

  // 2. Mock del ExecutionContext (Nuevo requisito)
  // No necesitamos que sea perfecto, solo que cumpla la interfaz para el test
  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockAdapter.getRequest({}),
      getResponse: () => mockAdapter.getResponse({}),
    }),
  } as unknown as ExecutionContext;

  const ctx = {};

  it("should resolve @Body correctly", async () => {
    const metadata: ResolvedParamMetadata[] = [
      { index: 0, type: "BODY", data: undefined, resolvedPipes: [] },
    ];

    const args = await resolver.resolve(
      ctx,
      metadata,
      [],
      mockAdapter,
      mockExecutionContext
    );

    expect(args[0]).toEqual({ name: "Karin" });
    expect(mockAdapter.readBody).toHaveBeenCalled();
  });

  it("should resolve @Query('page') correctly", async () => {
    const metadata: ResolvedParamMetadata[] = [
      { index: 0, type: "QUERY", data: "page", resolvedPipes: [] },
    ];

    const args = await resolver.resolve(
      ctx,
      metadata,
      [],
      mockAdapter,
      mockExecutionContext
    );

    expect(args[0]).toBe("1");
    expect(mockAdapter.getQuery).toHaveBeenCalled();
  });

  it("should resolve multiple parameters in the correct order", async () => {
    const metadata: ResolvedParamMetadata[] = [
      { index: 1, type: "BODY", resolvedPipes: [] },
      { index: 0, type: "PARAM", data: "id", resolvedPipes: [] },
    ];

    const args = await resolver.resolve(
      ctx,
      metadata,
      [],
      mockAdapter,
      mockExecutionContext
    );

    expect(args[0]).toBe("123");
    expect(args[1]).toEqual({ name: "Karin" });
  });

  it("should resolve Custom Decorators and execute their factory", async () => {
    const customFactory = mock((data, context) => {
      const req = context.switchToHttp().getRequest();
      return req.headers.get("Authorization");
    });

    const metadata: ResolvedParamMetadata[] = [
      {
        index: 0,
        type: "CUSTOM",
        data: "some-data",
        factory: customFactory,
        resolvedPipes: [],
      },
    ];

    const args = await resolver.resolve(
      ctx,
      metadata,
      [],
      mockAdapter,
      mockExecutionContext
    );

    expect(customFactory).toHaveBeenCalled();
    expect(args[0]).toBe("Bearer token");

    expect(customFactory).toHaveBeenCalledWith(
      "some-data",
      mockExecutionContext
    );
  });
});
