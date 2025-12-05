import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/**/*.schema.ts",
    out: "./drizzle",
    dialect: "mysql",
    dbCredentials: {
        url: process.env.MARIADB_DATABASE_URL!,
    },
});
