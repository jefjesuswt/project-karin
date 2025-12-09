import { ArgumentsHost, Catch, Logger } from "@project-karin/core";
import { BaseExceptionFilter } from "@project-karin/core";

@Catch()
export class DrizzleExceptionFilter extends BaseExceptionFilter {
    private drizzleLogger = new Logger("DrizzleExceptionFilter");

    catch(exception: any, host: ArgumentsHost) {
        const code = exception?.code;

        // Postgres / Drizzle Error Codes
        if (code === "23505") {
            // Unique violation
            return new Response(
                JSON.stringify({
                    statusCode: 409,
                    message: "Conflict: Duplicate entry",
                    error: "Conflict",
                }),
                {
                    status: 409,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        if (code === "23503") {
            // Foreign key violation
            return new Response(
                JSON.stringify({
                    statusCode: 400,
                    message: "Bad Request: Invalid reference (Foreign Key Violation)",
                    error: "Bad Request",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Handle generic "Failed query" messages if code is missing
        if (exception?.message?.includes("Failed query")) {
            // We can log it specifically
            this.drizzleLogger.error(`Database Error: ${exception.message}`, exception.stack);

            // Let BaseExceptionFilter handle the response (it will hide details in production)
            return super.catch(exception, host);
        }

        return super.catch(exception, host);
    }
}
