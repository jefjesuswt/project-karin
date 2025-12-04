import { Redis, type RedisOptions } from "ioredis";
import { RedisAdapter } from "./adapter.interface";

type IoRedisOptionsPartial = {
    [K in keyof RedisOptions]: RedisOptions[K] | (() => RedisOptions[K]);
};

export type IoRedisConfig =
    | string
    | IoRedisOptionsPartial
    | (() => string | RedisOptions);

export class IoRedisAdapter implements RedisAdapter<Redis> {
    constructor(private readonly config: IoRedisConfig) { }

    async connect(): Promise<Redis> {
        let finalOptions: any;
        let url: string | undefined;

        if (typeof this.config === "function") {
            const result = this.config();
            if (typeof result === "string") {
                url = result;
                finalOptions = {};
            } else {
                finalOptions = result;
            }
        } else if (typeof this.config === "string") {
            url = this.config;
            finalOptions = {};
        } else {
            finalOptions = {};
            for (const [key, value] of Object.entries(this.config)) {
                finalOptions[key] = typeof value === "function" ? (value as Function)() : value;
            }
        }

        finalOptions.lazyConnect = true;

        const client = url
            ? new Redis(url, finalOptions)
            : new Redis(finalOptions);

        if (client.status !== "ready") {
            await client.connect();
        }

        return client;
    }

    async disconnect(client: Redis): Promise<void> {
        if (client.status === "ready") {
            await client.quit();
        } else {
            client.disconnect();
        }
    }
}