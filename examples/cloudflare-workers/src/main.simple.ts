import { KarinFactory } from "@project-karin/core";
import { HonoAdapter } from "@project-karin/platform-hono";
import { ConfigPlugin } from "@project-karin/config";
import { Controller, Get } from "@project-karin/core";

@Controller("/api")
class SimpleController {
    @Get("/")
    root() {
        return {
            message: "🦊 Karin.js on Cloudflare Workers!",
            timestamp: new Date().toISOString(),
        };
    }

    @Get("/health")
    health() {
        return { status: "healthy" };
    }
}

// Simple example without external services
const config = new ConfigPlugin();

export default KarinFactory.serverless(new HonoAdapter(), {
    controllers: [SimpleController],
    plugins: [config],
});
