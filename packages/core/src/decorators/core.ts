import "reflect-metadata";
import { GUARDS_METADATA, PIPES_METADATA } from "./constants";
import type { CanActivate, PipeTransform, Type } from "../interfaces";

export function UseGuards(
  ...guards: (CanActivate | Function)[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    _key?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(GUARDS_METADATA, guards, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(GUARDS_METADATA, guards, target);
    return target;
  };
}

export function UsePipes(
  ...pipes: (PipeTransform | Function)[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    _key?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(PIPES_METADATA, pipes, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(PIPES_METADATA, pipes, target);
    return target;
  };
}

export function SetMetadata<K = any, V = any>(
  metadataKey: K,
  metadataValue: V
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    _key?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(metadataKey, metadataValue, target);
    return target;
  };
}
