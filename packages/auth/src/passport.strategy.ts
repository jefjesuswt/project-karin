import { StrategyRegistry } from "./strategy.registry";
import type { IAuthStrategy } from "./interfaces";
import type { ExecutionContext } from "@karin-js/core";

export abstract class PassportStrategy implements IAuthStrategy {
    constructor(public readonly name: string) {
        StrategyRegistry.register(this);
    }

    // This method is called by the Guard
    // It should extract credentials and call validate()
    abstract authenticate(context: ExecutionContext): Promise<any>;

    // User implements this to verify credentials
    abstract validate(...args: any[]): Promise<any>;
}
