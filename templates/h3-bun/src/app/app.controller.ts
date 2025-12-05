import { Controller, Get } from "@project-karin/core";

@Controller("/")
export class AppController {
  @Get("/")
  simple() {
    return { hello: "karin!" };
  }
}
