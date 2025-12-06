import { toPascalCase, toKebabCase } from "../utils/formatting";

export function generateControllerTemplate(name: string, withCrud = false) {
  const className = toPascalCase(name);
  const routeName = toKebabCase(name);
  const paramName = "id";

  if (withCrud) {
    return `import { Controller, Get, Post, Put, Delete, Body, Param, inject } from "@project-karin/core";
import { ${className}Service } from "./${routeName}.service";
import { type Create${className}Dto } from "./dtos/create-${routeName}.dto";
import { type Update${className}Dto } from "./dtos/update-${routeName}.dto";

@Controller("/${routeName}")
export class ${className}Controller {
  constructor(@inject(${className}Service) private readonly service: ${className}Service) {}

  @Post("/")
  create(@Body() body: Create${className}Dto) {
    return this.service.create(body);
  }

  @Get("/")
  findAll() {
    return this.service.findAll();
  }

  @Get("/:${paramName}")
  findOne(@Param("${paramName}") ${paramName}: string) {
    return this.service.findOne(${paramName});
  }

  @Put("/:${paramName}")
  update(@Param("${paramName}") ${paramName}: string, @Body() body: Update${className}Dto) {
    return this.service.update(${paramName}, body);
  }

  @Delete("/:${paramName}")
  remove(@Param("${paramName}") ${paramName}: string) {
    return this.service.remove(${paramName});
  }
}
`;
  }

  return `import { Controller, Get, inject } from "@project-karin/core";

@Controller("/${routeName}")
export class ${className}Controller {
  @Get("/")
  findAll() {
    return { message: "This action returns all ${routeName}" };
  }
}
`;
}
