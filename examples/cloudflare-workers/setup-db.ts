import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
});

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

console.log("Creating users table...");

await db.run(sql`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
  )
`);

console.log("✅ Table created successfully!");

// Insert a test user
console.log("Inserting test user...");
const result = await db.insert(users).values({
    name: "John Doe",
    email: "john@example.com",
}).returning();

console.log("✅ Test user created:", result);

// Query all users
const allUsers = await db.select().from(users);
console.log("📋 All users:", allUsers);

process.exit(0);
