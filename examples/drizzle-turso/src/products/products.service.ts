import { Service } from "@karin-js/core";
import { InjectDrizzle } from "@karin-js/drizzle";
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
