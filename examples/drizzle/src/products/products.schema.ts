import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";

export const products = mysqlTable("products", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    price: int("price").notNull(),
    description: text("description"),
});
