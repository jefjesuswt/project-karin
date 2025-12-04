import { Redis } from "@upstash/redis";
import { RedisAdapter } from "./adapter.interface";

export interface UpstashConfig {
    url: string;
    token: string;
    [key: string]: any;
}

export class UpstashAdapter implements RedisAdapter<Redis> {
    constructor(private readonly config: UpstashConfig | (() => UpstashConfig)) { }

    connect(): Redis {
        const options = typeof this.config === "function" ? this.config() : this.config;

        return new Redis(options);
    }

    disconnect(): void {
    }
}