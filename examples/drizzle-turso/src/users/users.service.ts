import { Service } from "@project-karin/core";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./users.schema";
import type { CreateUserDto } from "./dto/create-user.dto";
import { InjectDrizzle } from "@project-karin/drizzle";

@Service()
export class UsersService {
    constructor(
        @InjectDrizzle() private readonly db: LibSQLDatabase<typeof schema>
    ) { }

    async findAll() {
        return this.db.select().from(schema.users).all();
    }

    async create(data: CreateUserDto) {
        return this.db.insert(schema.users).values(data).returning();
    }
}
