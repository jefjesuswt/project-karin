import type { ExecutionContext } from "@project-karin/core";

export interface IAuthStrategy {
    name: string;
    authenticate(context: ExecutionContext): Promise<any>;
}

export interface AuthModuleOptions {
    defaultStrategy?: string;
}
