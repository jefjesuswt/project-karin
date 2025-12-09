import { ArgumentsHost, Catch, Logger } from "@project-karin/core";
import { BaseExceptionFilter } from "@project-karin/core";

@Catch()
export class RedisExceptionFilter extends BaseExceptionFilter {
    private redisLogger = new Logger("RedisExceptionFilter");

    catch(exception: any, host: ArgumentsHost) {
        // Connection Errors (ECONNREFUSED is common when Redis is down)
        if (exception?.code === 'ECONNREFUSED' || exception?.message?.includes('Reach redis server')) {
            this.redisLogger.error(`Redis Connection Error: ${exception.message}`, exception.stack);

            return new Response(
                JSON.stringify({
                    statusCode: 503,
                    message: "Service Unavailable: Cache service is down",
                    error: "Service Unavailable",
                }),
                {
                    status: 503,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Command Timeout
        if (exception?.message?.includes('Command timed out')) {
            return new Response(
                JSON.stringify({
                    statusCode: 504,
                    message: "Gateway Timeout: Cache operation timed out",
                    error: "Gateway Timeout",
                }),
                {
                    status: 504,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Upstash Errors
        if (exception?.name === 'UpstashError' || exception?.constructor?.name === 'UpstashError') {
            this.redisLogger.error(`Upstash Error: ${exception.message}`, exception.stack);

            if (exception.message.includes("Unauthorized") || exception.message.includes("unauthorized")) {
                return new Response(
                    JSON.stringify({
                        statusCode: 500, // Internal Server Error because it's a configuration issue on server side usually
                        message: "Internal Server Error: Cache authentication failed",
                        error: "Internal Server Error",
                    }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
            // Let BaseExceptionFilter handle other Upstash errors as 500
        }

        // Generic Redis Errors
        // ioredis errors usually have name 'RedisError' or inherit from it
        if (exception?.name === 'RedisError' || exception?.constructor?.name === 'RedisError') {
            this.redisLogger.error(`Redis Error: ${exception.message}`, exception.stack);
            // We let BaseExceptionFilter handle the response (500) but we logged it specifically
        }

        return super.catch(exception, host);
    }
}
