import type { ExecutionContext } from "@karin-js/core";

export interface IAuthStrategy {
    name: string;
    authenticate(context: ExecutionContext): Promise<any>;
}

export interface AuthModuleOptions {
    defaultStrategy?: string;
}
