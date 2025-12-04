import { Service } from "@project-karin/core";
import { InjectDrizzle } from "@project-karin/drizzle";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./products.schema";
import type { CreateProductDto } from "./dto/create-product.dto";

@Service()
export class ProductsService {
    constructor(
        @InjectDrizzle() private readonly db: LibSQLDatabase<typeof schema>
    ) { }

    async findAll() {
        return this.db.select().from(schema.products).all();
    }

    async create(data: CreateProductDto) {
        return this.db.insert(schema.products).values(data).returning();
    }
}
