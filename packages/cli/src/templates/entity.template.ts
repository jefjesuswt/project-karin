import { toPascalCase } from "../utils/formatting";

export function generateEntityTemplate(name: string) {
  const className = toPascalCase(name);

  return `import { Schema, Prop } from "@karin-js/mongoose";

@Schema("${className}")
export class ${className} {
  @Prop({ required: true, index: true })
  name: string;
}
`;
}
