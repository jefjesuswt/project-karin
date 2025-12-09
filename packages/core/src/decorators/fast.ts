import "reflect-metadata";
import { FAST_ROUTE_METADATA } from "./constants";

export function Fast(): MethodDecorator {
  return (
    _target: any,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(FAST_ROUTE_METADATA, true, descriptor.value);
    return descriptor;
  };
}
