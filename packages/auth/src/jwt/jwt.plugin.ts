import { type KarinPlugin, type KarinApplication, container } from "@project-karin/core";
import { JwtService, JWT_OPTIONS, type JwtModuleOptions } from "./jwt.service";

export class JwtPlugin implements KarinPlugin {
    name = "JwtPlugin";

    constructor(private readonly options: JwtModuleOptions) { }

    install(app: KarinApplication): void {
        container.register(JWT_OPTIONS, { useValue: this.options });
        container.registerSingleton(JwtService);
    }
}
