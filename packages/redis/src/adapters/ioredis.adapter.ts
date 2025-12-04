import { Redis, type RedisOptions } from "ioredis";
import { RedisAdapter } from "./adapter.interface";

export type IoRedisConfig = string | RedisOptions | (() => string | RedisOptions);

export class IoRedisAdapter implements RedisAdapter<Redis> {
    constructor(private readonly config: IoRedisConfig) { }

    async connect(): Promise<Redis> {
        const resolvedConfig = typeof this.config === "function" ? this.config() : this.config;

        const finalOptions: RedisOptions = typeof resolvedConfig === "string"
            ? { lazyConnect: true }
            : { ...resolvedConfig, lazyConnect: true };

        const client = typeof resolvedConfig === "string"
            ? new Redis(resolvedConfig, finalOptions)
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