import { Service } from "@project-karin/core";
import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "./users.schema";
import type { CreateUserDto } from "./dto/create-user.dto";
import { InjectDrizzle } from "@project-karin/drizzle";

@Service()
export class UsersService {
    constructor(
        @InjectDrizzle() private readonly db: MySql2Database<typeof schema>
    ) { }

    async findAll() {
        return this.db.select().from(schema.users);
    }

    async create(data: CreateUserDto) {
        const [result] = await this.db.insert(schema.users).values(data);
        // In MySQL, we can't easily get the inserted row back in one query without extra steps or specific driver support.
        // For this example, we'll just return the insert result which contains insertId.
        return { id: result.insertId, ...data };
    }
}
