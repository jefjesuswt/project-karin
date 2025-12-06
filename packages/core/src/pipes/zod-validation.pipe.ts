import type { ZodType, ZodError, z } from "zod";
import type { PipeTransform, ArgumentMetadata } from "../interfaces";
import { BadRequestException } from "../exceptions/http.exception";
import { ZOD_SCHEMA_METADATA } from "./zod-dto.decorator";

export class ZodValidationPipe implements PipeTransform {
  constructor(public readonly schema?: ZodType<any>) { }

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === "custom") return value;

    let schema = this.schema;

    // If no schema provided in constructor, try to find it in the metatype (class)
    if (!schema && metadata.metatype) {
      schema = Reflect.getMetadata(ZOD_SCHEMA_METADATA, metadata.metatype);
      console.log(`[ZodValidationPipe] Resolving schema for ${metadata.metatype.name}: ${schema ? 'Found' : 'Not Found'}`);
    }

    // If still no schema, we cannot validate
    if (!schema) {
      console.log(`[ZodValidationPipe] No schema found for ${metadata.metatype?.name}, skipping validation.`);
      return value;
    }

    const result = schema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    const zodError = result.error as ZodError;

    const errors = zodError.issues.map((err: z.core.$ZodIssue) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));

    throw new BadRequestException({
      message: "Validation failed",
      errors: errors,
    });
  }
}
