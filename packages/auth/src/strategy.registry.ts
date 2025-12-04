import type { IAuthStrategy } from "./interfaces";

export class StrategyRegistry {
    private static strategies = new Map<string, IAuthStrategy>();

    static register(strategy: IAuthStrategy) {
        this.strategies.set(strategy.name, strategy);
    }

    static get(name: string): IAuthStrategy | undefined {
        return this.strategies.get(name);
    }
}
