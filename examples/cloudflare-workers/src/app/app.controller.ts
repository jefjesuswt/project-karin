import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpException,
} from "@project-karin/core";
import { InjectDrizzle } from "@project-karin/drizzle";
import { InjectRedis } from "@project-karin/redis";
import { z } from "zod";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { Redis } from "@upstash/redis";

const CreateUserDto = z.object({
    name: z.string().min(1),
    email: z.string().email(),
});

@Controller("/api")
export class AppController {
    constructor(
        @InjectDrizzle() private db: LibSQLDatabase,
        @InjectRedis() private redis: Redis
    ) { }

    @Get("/")
    async root() {
        return {
            message: "🦊 Karin on Cloudflare Workers!",
            timestamp: new Date().toISOString(),
        };
    }

    @Get("/health")
    async health() {
        // Test Redis connection
        const redisOk = await this.redis
            .ping()
            .then(() => true)
            .catch(() => false);

        // Test Database connection
        const dbOk = await this.db
            .select()
            .from(users)
            .limit(1)
            .then(() => true)
            .catch(() => false);

        return {
            status: redisOk && dbOk ? "healthy" : "degraded",
            services: {
                redis: redisOk ? "ok" : "error",
                database: dbOk ? "ok" : "error",
            },
        };
    }

    @Get("/users")
    async getUsers() {
        // Try to get from cache first
        const cached = await this.redis.get("users:all");
        if (cached) {
            return { source: "cache", data: cached };
        }

        // Get from database
        const allUsers = await this.db.select().from(users);

        // Cache for 60 seconds
        await this.redis.set("users:all", JSON.stringify(allUsers), { ex: 60 });

        return { source: "database", data: allUsers };
    }

    @Get("/redis/ping")
    async redisPing() {
        const result = await this.redis.ping();
        return { message: "Redis is working!", ping: result };
    }

    @Get("/users/:id")
    async getUser(@Param("id") id: string) {
        const userId = parseInt(id);
        if (isNaN(userId)) {
            throw new HttpException("Invalid user ID", 400);
        }

        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!user) {
            throw new HttpException("User not found", 404);
        }

        return { source: "database", data: user };
    }

    @Post("/users")
    async createUser(@Body(CreateUserDto) body: z.infer<typeof CreateUserDto>) {
        const [newUser] = await this.db
            .insert(users)
            .values(body)
            .returning();

        // Invalidate cache
        await this.redis.del("users:all");

        return {
            message: "User created successfully",
            data: newUser,
        };
    }

    @Get("/cache/stats")
    async getCacheStats() {
        const keys = await this.redis.keys("*");
        return {
            totalKeys: keys.length,
            keys,
        };
    }
}
