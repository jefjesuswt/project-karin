import "reflect-metadata";
import type { ZodSchema } from "zod";

export const ZOD_SCHEMA_METADATA = "karin:zod-schema";

export function ZodDto(schema: ZodSchema): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(ZOD_SCHEMA_METADATA, schema, target);
    };
}
