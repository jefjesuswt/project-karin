export { RedisPlugin, RedisPluginOptions } from "./src/redis.plugin";
export { type KarinRedisConfig } from "./src/redis.options";
export { InjectRedis, REDIS_CLIENT_TOKEN } from "./src/decorators";
export { Redis } from "ioredis";
export type { RedisOptions } from "ioredis";

export { IoRedisAdapter } from "./src/adapters/ioredis.adapter";
export { UpstashAdapter } from "./src/adapters/upstash.adapter";
export type { RedisAdapter } from "./src/adapters/adapter.interface";
