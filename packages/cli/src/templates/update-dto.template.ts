import { toPascalCase, toKebabCase } from "../utils/formatting";

export function generateUpdateDtoTemplate(name: string) {
  const className = toPascalCase(name);

  const baseName = name.replace(/^update-/, "");

  const baseKebab = toKebabCase(baseName);
  const basePascal = toPascalCase(baseName);

  const createDtoName = `Create${basePascal}Dto`;
  const importFile = `create-${baseKebab}.dto`;

  return `import { z } from "zod";
import { ${createDtoName} } from "./${importFile}";

export const ${className}Dto = ${createDtoName}.partial();

export type ${className}Dto = z.infer<typeof ${className}Dto>;
`;
}
