import "reflect-metadata";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value);
    return descriptor;
};
