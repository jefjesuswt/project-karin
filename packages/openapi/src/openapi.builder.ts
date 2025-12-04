import "reflect-metadata";

import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import {
  CONTROLLER_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  PARAMS_METADATA,
  type RouteParamMetadata,
  type KarinApplication,
  type Type,
} from "@project-karin/core";
import { ZodValidationPipe } from "@project-karin/core";
import type { OpenAPIObject } from "openapi3-ts/oas30";

export class OpenApiBuilder {
  private registry = new OpenAPIRegistry();

  constructor(private readonly app: KarinApplication) {}

  public build(): OpenAPIObject {
    const controllers = this.app.getControllers();

    controllers.forEach((controller) => {
      this.processController(controller as Type<any>);
    });

    const generator = new OpenApiGeneratorV3(this.registry.definitions);
    return generator.generateDocument({
      openapi: "3.0.0",
      info: {
        title: "Karin API",
        version: "1.0.0",
      },
    });
  }

  private processController(controller: Type<any>) {
    const prefix = Reflect.getMetadata(
      CONTROLLER_METADATA,
      controller
    ) as string;
    const proto = controller.prototype;
    const methodNames = Object.getOwnPropertyNames(proto).filter(
      (m) => m !== "constructor"
    );

    methodNames.forEach((methodName) => {
      const method = proto[methodName];

      if (typeof method !== "function") return;

      const httpMethod = Reflect.getMetadata(METHOD_METADATA, method);
      const path = Reflect.getMetadata(PATH_METADATA, method);

      if (httpMethod && path) {
        this.registerPath(
          controller,
          method,
          methodName,
          prefix,
          path,
          httpMethod
        );
      }
    });
  }

  private registerPath(
    controller: Type<any>,
    method: Function,
    methodName: string,
    prefix: string,
    path: string,
    httpMethod: string
  ) {
    const fullPath = `/${prefix}/${path}`.replace(/\/+/g, "/");
    const swaggerPath = fullPath.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");

    const params: RouteParamMetadata[] =
      Reflect.getMetadata(PARAMS_METADATA, controller.prototype, methodName) ||
      [];

    let requestBodySchema: any = undefined;

    const bodyParam = params.find((p) => p.type === "BODY");
    if (bodyParam && bodyParam.pipes) {
      const zodPipe = bodyParam.pipes.find(
        (p: any) => p instanceof ZodValidationPipe
      ) as ZodValidationPipe | undefined;

      if (zodPipe && zodPipe.schema) {
        requestBodySchema = {
          description: "Request Body",
          content: {
            "application/json": {
              schema: zodPipe.schema,
            },
          },
        };
      }
    }

    const requestConfig: any = {};
    if (requestBodySchema) {
      requestConfig.body = requestBodySchema;
    }

    this.registry.registerPath({
      method: httpMethod.toLowerCase() as any,
      path: swaggerPath,
      tags: [controller.name.replace("Controller", "")],
      request:
        Object.keys(requestConfig).length > 0 ? requestConfig : undefined,
      responses: {
        200: {
          description: "Successful response",
        },
      },
    });
  }
}
