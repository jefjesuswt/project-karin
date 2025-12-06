import "reflect-metadata";
import { PARAMS_METADATA } from "./constants";
import type { PipeTransform, Type, ExecutionContext } from "../interfaces";

export type ParamType =
  | "BODY"
  | "QUERY"
  | "PARAM"
  | "HEADERS"
  | "REQ"
  | "RES"
  | "CUSTOM";

export interface RouteParamMetadata {
  index: number;
  type: ParamType;
  data?: any;
  pipes?: (PipeTransform | Type<PipeTransform>)[];
  factory?: (data: any, context: ExecutionContext) => any;
  metatype?: any;
}

// Factory for creating custom parameter decorators (e.g. @User())
export function createParamDecorator<T = any>(
  factory: (data: T, ctx: ExecutionContext) => any
) {
  return (
    data?: T,
    ...pipes: (PipeTransform | Type<PipeTransform>)[]
  ): ParameterDecorator => {
    return (target, propertyKey, parameterIndex) => {
      if (!propertyKey) return;

      const existingParameters: RouteParamMetadata[] =
        Reflect.getMetadata(PARAMS_METADATA, target, propertyKey) || [];

      existingParameters.push({
        index: parameterIndex,
        type: "CUSTOM",
        data,
        pipes,
        factory,
      });

      Reflect.defineMetadata(
        PARAMS_METADATA,
        existingParameters,
        target,
        propertyKey
      );
    };
  };
}

// Factory for standard HTTP parameter decorators (e.g. @Body(), @Query())
const createNativeParamDecorator = (type: ParamType) => {
  return (
    dataOrPipeOrType?: string | PipeTransform | Type<PipeTransform> | Type<any>,
    ...pipes: (PipeTransform | Type<PipeTransform>)[]
  ): ParameterDecorator => {
    return (target, propertyKey, parameterIndex) => {
      if (!propertyKey) return;
      const existingParameters: RouteParamMetadata[] =
        Reflect.getMetadata(PARAMS_METADATA, target, propertyKey) || [];

      const paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
      let metatype = paramTypes ? paramTypes[parameterIndex] : undefined;

      let data: string | undefined;
      const allPipes = [...pipes];

      // Handle optional data key: @Body('email') vs @Body()
      if (typeof dataOrPipeOrType === "string") {
        data = dataOrPipeOrType;
      } else if (
        typeof dataOrPipeOrType === "function" &&
        !dataOrPipeOrType.prototype?.transform // It's a class (DTO), not a Pipe class
      ) {
        // It's a DTO class passed explicitly (e.g. @Body(CreateDto))
        metatype = dataOrPipeOrType;
      } else if (dataOrPipeOrType) {
        // It's a Pipe instance or Pipe class
        allPipes.unshift(dataOrPipeOrType as any);
      }

      existingParameters.push({
        index: parameterIndex,
        type,
        data,
        pipes: allPipes,
        metatype,
      });

      Reflect.defineMetadata(
        PARAMS_METADATA,
        existingParameters,
        target,
        propertyKey
      );
    };
  };
};

export const Body = createNativeParamDecorator("BODY");
export const Query = createNativeParamDecorator("QUERY");
export const Param = createNativeParamDecorator("PARAM");
export const Headers = createNativeParamDecorator("HEADERS");
export const Req = createNativeParamDecorator("REQ");
export const Res = createNativeParamDecorator("RES");

export const Ctx = createParamDecorator((data, ctx) => ctx);
