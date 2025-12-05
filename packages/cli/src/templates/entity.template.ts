import { toPascalCase } from "../utils/formatting";

export function generateEntityTemplate(name: string) {
  const className = toPascalCase(name);

  return `/**
 * ${className} Entity
 * 
 * Use this interface as a reference for your database schema.
 * 
 * Examples:
 * 
 * Drizzle (SQLite/MySQL/PostgreSQL):
 * Create a ${name}.schema.ts file:
 * 
 * import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
 * 
 * export const ${name}s = sqliteTable("${name}s", {
 *   id: text("id").primaryKey(),
 *   name: text("name").notNull(),
 *   createdAt: integer("created_at", { mode: "timestamp" }),
 *   updatedAt: integer("updated_at", { mode: "timestamp" }),
 * });
 * 
 * Mongoose:
 * Add decorators to this class:
 * 
 * import { Schema, Prop } from "@project-karin/mongoose";
 * 
 * @Schema("${className}")
 * export class ${className} implements ${className}Entity {
 *   @Prop({ required: true })
 *   name: string;
 *   // ... other fields
 * }
 */
export interface ${className}Entity {
  id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
`;
}

