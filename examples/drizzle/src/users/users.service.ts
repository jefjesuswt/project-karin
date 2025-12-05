
import { Service } from "@project-karin/core";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./users.schema";
import type { CreateUserDto } from "./dto/create-user.dto";
import { InjectDrizzle } from "@project-karin/drizzle";
import { InjectRedis } from "@project-karin/redis";
import type { Redis } from "@upstash/redis";

@Service()
export class UsersService {
    constructor(
        @InjectDrizzle() private readonly db: LibSQLDatabase<typeof schema>,
        @InjectRedis() private readonly redis: Redis
    ) { }

    async findAll() {
        // Try cache first
        const cached = await this.redis.get("users:all");
        if (cached) {
            return { source: "cache", data: cached };
        }

        const users = await this.db.select().from(schema.users);

        // Cache for 60 seconds
        await this.redis.set("users:all", JSON.stringify(users), { ex: 60 });

        return { source: "database", data: users };
    }

    async create(data: CreateUserDto) {
        const result = await this.db.insert(schema.users).values(data).returning();

        // Invalidate cache
        await this.redis.del("users:all");

        return result[0];
    }
}

