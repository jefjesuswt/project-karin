import { Redis } from "@upstash/redis";
import { RedisAdapter } from "./adapter.interface";

export type UpstashConfig = {
    url: string | (() => string);
    token: string | (() => string);
    [key: string]: any;
} | (() => { url: string; token: string;[key: string]: any });

export class UpstashAdapter implements RedisAdapter<Redis> {
    constructor(private readonly config: UpstashConfig) { }

    connect(): Redis {
        let options: any;

        if (typeof this.config === "function") {
            options = this.config();
        }
        else {
            options = {};
            for (const [key, value] of Object.entries(this.config)) {
                options[key] = typeof value === "function" ? (value as Function)() : value;
            }
        }

        return new Redis(options);
    }

    disconnect(): void { }
}