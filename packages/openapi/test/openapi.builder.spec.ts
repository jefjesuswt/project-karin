import "reflect-metadata";
import { describe, it, expect, beforeEach } from "bun:test";
import { OpenApiBuilder } from "../src/openapi.builder";
import { Controller, Get, Post, Body, Param, ZodValidationPipe } from "@project-karin/core";
import { z } from "zod";

@Controller("users")
class UsersController {
  @Get("list")
  getUsers() { }

  @Post("create")
  createUser(
    @Body(new ZodValidationPipe(z.object({ name: z.string() }))) body: any
  ) { }

  @Get(":id")
  getUser(@Param("id") id: string) { }
}

describe("OpenApiBuilder", () => {
  let appMock: any;

  beforeEach(() => {
    appMock = {
      getControllers: () => [UsersController],
    };
  });

  it("should generate openapi document with paths", () => {
    const builder = new OpenApiBuilder(appMock);
    const doc = builder.build();

    expect(doc.openapi).toBe("3.0.0");
    expect(doc.info.title).toBe("Karin API");

    const listPath = doc.paths["/users/list"];
    expect(listPath).toBeDefined();
    expect(listPath?.get).toBeDefined();
    expect(listPath?.get?.tags).toContain("Users");

    const createPath = doc.paths["/users/create"];
    expect(createPath).toBeDefined();
    expect(createPath?.post).toBeDefined();

    const requestBody = createPath?.post?.requestBody as any;
    expect(requestBody).toBeDefined();
    expect(requestBody.content["application/json"].schema).toBeDefined();
  });

  it("should handle route parameters conversion", () => {
    const builder = new OpenApiBuilder(appMock);
    const doc = builder.build();

    expect(doc.paths).toHaveProperty("/users/{id}");
    expect(doc.paths["/users/{id}"].get).toBeDefined();
  });
});
