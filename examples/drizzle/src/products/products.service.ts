import { Service } from "@project-karin/core";
import { InjectDrizzle } from "@project-karin/drizzle";
import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "./products.schema";
import type { CreateProductDto } from "./dto/create-product.dto";

@Service()
export class ProductsService {
    constructor(
        @InjectDrizzle() private readonly db: MySql2Database<typeof schema>
    ) { }

    async findAll() {
        return this.db.select().from(schema.products);
    }

    async create(data: CreateProductDto) {
        const [result] = await this.db.insert(schema.products).values(data);
        return { id: result.insertId, ...data };
    }
}
