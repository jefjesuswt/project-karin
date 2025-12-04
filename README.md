# Karin 🦊

[![NPM Version](https://img.shields.io/npm/v/@project-karin/core)](https://www.npmjs.com/package/@project-karin/core)
[![Bun Version](https://img.shields.io/badge/bun-%3E%3D1.2.10-lightgrey?logo=bun)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A lightweight, decorator-based backend framework for Bun.**

Karin is a personal learning project exploring modern backend patterns in the Bun ecosystem. It draws inspiration from established frameworks like NestJS while experimenting with a module-less architecture optimized for Bun's performance characteristics.

## ⚠️ Project Status: Beta (v1.1.0)

This is an **experimental learning project** and a work in progress. While functional, it's not yet battle-tested for production use.

### Features

- **Bun-First**: Built from the ground up to leverage Bun's speed and native APIs.
- **Module-less Architecture**: Simplified structure without the complexity of NgModules, similar to modern standalone components.
- **Dependency Injection**: Robust DI system powered by `tsyringe`.
- **Decorator-Based**: Familiar syntax for defining Controllers, Services, Guards, and Pipes.
- **Type-Safe**: Written in TypeScript with a focus on type safety and developer experience.
- **Karin**: Core framework logic.
- ✅ Decorator-based routing (`@Controller`, `@Get`, `@Post`, etc.)
- ✅ Dependency Injection with TypeScript decorators
- ✅ Guards, Pipes, Interceptors, and Exception Filters
- ✅ Multiple HTTP adapters (H3, Hono)
- ✅ Plugin system (Config, Mongoose, Redis, OpenAPI)
- ✅ File-based controller discovery
- ✅ Graceful shutdown and error handling
- ✅ Custom decorators and parameter extractors

**Known limitations:**

- ⚠️ Request-scoped DI not fully implemented
- ⚠️ Limited production testing
- ⚠️ No WebSockets or GraphQL support (yet)
- ⚠️ Documentation is evolving

**Good for:**

- Learning TypeScript decorators and metadata reflection
- Prototyping and side projects
- Exploring Bun's performance capabilities
- Small to medium APIs

**Not recommended for:**

- Mission-critical production systems
- Large enterprise applications (consider [NestJS](https://nestjs.com/))
- Projects requiring extensive ecosystem support

---

## Table of Contents

- [Why Karin?](#why-karin)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Packages](#packages)
- [Benchmarks](#benchmarks)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Why Karin?

### A Learning-Focused Alternative

Karin is **not** trying to replace NestJS or any established framework. Instead, it's:

1.  **A learning tool** for understanding how decorator-based frameworks work under the hood
2.  **An experiment** in module-less architecture for simpler project structures
3.  **A playground** for exploring Bun's native performance characteristics

### Flexible Architecture

Karin offers **two ways** to structure your application:

#### 1. File-Based Discovery

Automatically discover controllers by scanning files:

```typescript
await KarinFactory.create(new HonoAdapter(), {
  scan: "./src/**/*.ts", // Auto-discover controllers
  plugins: [
    new ConfigPlugin(), 
    new MongoosePlugin({ uri: "..." })
  ],
});
```

#### 2. Manual Registration (Recommended for Serverless)

Explicitly declare controllers and models:

```typescript
import { DogsController } from "./dogs/dogs.controller";
import { Dogs } from "./dogs/entities/dogs.entity";

await KarinFactory.create(new HonoAdapter(), {
  controllers: [DogsController, FoxesController], // Manual registration
  plugins: [
    new MongoosePlugin({
      uri: "...",
      models: [Dogs, Foxes], // Explicit models
    }),
  ],
});
```

**Benefits of each approach:**

**File-Based Discovery:**

- ✅ Less boilerplate
- ✅ Faster prototyping
- ✅ Automatic updates when adding controllers
- ❌ Requires file system access (not ideal for serverless)

**Manual Registration:**

- ✅ Better for serverless/edge deployments
- ✅ Explicit dependencies (better for tree-shaking)
- ✅ No file system scanning overhead
- ❌ More verbose

### When to Use Karin

**Consider Karin if you:**

- Want to learn how decorator-based frameworks work
- Are building a small to medium API (< 50 endpoints)
- Value simplicity over extensive features
- Want to leverage Bun's performance
- Are prototyping or building side projects

**Choose NestJS (or similar) if you:**

- Need a proven, production-ready framework
- Are building a large, complex application
- Require extensive ecosystem support (GraphQL, microservices, etc.)
- Need enterprise-grade features and support
- Are working with a large team

---

## Quick Start

### Using the CLI (Recommended)

The fastest way to get started is using the Karin CLI:

```bash
# Install the CLI globally
bun install -g @project-karin/cli

#To start a new project with Karin:
karin new my-karin-app

# Follow the prompts to select:
# - Environment (Server / Serverless)
# - Framework adapter (H3 / Hono)
# - Platform (for serverless: Cloudflare Workers / Deno Deploy)
# - Git initialization
# - Dependency installation

# Start developing
cd my-karin-app
bun run dev
```

### Manual Installation

### Prerequisites

- [Bun](https://bun.sh/) >= 1.2.10
- TypeScript >= 5.0

### Installation

```bash
# Create a new project
mkdir my-karin-app
cd my-karin-app
bun init -y

# Install Karin
bun add @project-karin/core @project-karin/platform-hono
bun add -d typescript @types/bun

# Enable decorators in tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

### Hello World

```typescript
// src/app.controller.ts
import { Controller, Get } from "@project-karin/core";

@Controller("/")
export class AppController {
  @Get()
  hello() {
    return { message: "Hello, Karin!" };
  }
}
```

```typescript
// src/main.ts

import { KarinFactory } from "@project-karin/core";
import { HonoAdapter } from "@project-karin/platform-hono";

async function bootstrap() {
  const app = await KarinFactory.create(new HonoAdapter(), {
    scan: "./src/**/*.ts",
  });

  app.listen(3000, () => {
    console.log("🦊 Server running on http://localhost:3000");
  });
}

bootstrap();
```

```bash
# Run the app
bun src/main.ts
```

Visit `http://localhost:3000` to see your API in action!

---

## Core Concepts

### Controllers

Controllers handle incoming requests and return responses:

```typescript
import { Controller, Get, Post, Body, Param } from "@project-karin/core";

@Controller("/users")
export class UsersController {
  @Get()
  findAll() {
    return [{ id: 1, name: "Alice" }];
  }

  @Get("/:id")
  findOne(@Param("id") id: string) {
    return { id, name: "Alice" };
  }

  @Post()
  create(@Body() body: any) {
    return { id: 2, ...body };
  }
}
```

### Services & Dependency Injection

Services encapsulate business logic and can be injected into controllers:

```typescript
import { Service } from "@project-karin/core";

@Service()
export class UsersService {
  findAll() {
    return [{ id: 1, name: "Alice" }];
  }
}

@Controller("/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

### Guards

Guards control access to routes:

```typescript
import { CanActivate, ExecutionContext } from "@project-karin/core";

@Service()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.headers.get("authorization") !== null;
  }
}

@Controller("/admin")
@UseGuards(AuthGuard)
export class AdminController {
  // Protected routes
}
```

### Pipes

Pipes transform and validate input data:

```typescript
import { PipeTransform, BadRequestException } from "@project-karin/core";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

@Service()
export class ValidationPipe implements PipeTransform {
  transform(value: any) {
    const result = CreateUserSchema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return result.data;
  }
}

@Post()
create(@Body(ValidationPipe) body: any) {
  return body; // Validated and typed
}
```

### Exception Filters

Filters handle errors and format responses:

```typescript
import { Catch, ExceptionFilter, HttpException } from "@project-karin/core";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    return new Response(
      JSON.stringify({
        statusCode: exception.status,
        message: exception.message,
        path: request.url,
      }),
      { status: exception.status }
    );
  }
}
```

### Plugins

Plugins extend framework functionality:

```typescript
import { ConfigPlugin } from "@project-karin/config";
import { MongoosePlugin } from "@project-karin/mongoose";
import { OpenApiPlugin } from "@project-karin/openapi";

const config = new ConfigPlugin({
  requiredKeys: ["MONGO_URI", "PORT"],
});

const app = await KarinFactory.create(new HonoAdapter(), {
  scan: "./src/**/*.ts",
  plugins: [
    config,
    new MongoosePlugin({
      uri: () => config.get("MONGO_URI"),
    }),
    new OpenApiPlugin({ path: "/docs" }),
  ],
});
```

---

## Packages

Karin is organized as a monorepo with multiple packages:

### Core Packages

- **[@project-karin/core](./packages/core)** - Core framework with DI, decorators, and routing
- **[@project-karin/platform-hono](./packages/platform-hono)** - Hono HTTP adapter (Edge/serverless)
- **[@project-karin/platform-h3](./packages/platform-h3)** - H3 HTTP adapter (maximum performance)

### Plugin Packages

- **[@project-karin/config](./packages/config)** - Configuration management with validation
- **[@project-karin/mongoose](./packages/mongoose)** - MongoDB integration with Mongoose
- **[@project-karin/redis](./packages/redis)** - Redis client integration
- **[@project-karin/openapi](./packages/openapi)** - OpenAPI/Swagger documentation

### CLI Package

- **[@project-karin/cli](./packages/cli)** - Project scaffolding and code generation

---

## Benchmarks

Performance benchmarks comparing Karin with other popular frameworks. All tests performed on the same hardware with identical test conditions.

### Test Environment

- **Hardware**: AMD Ryzen 5 5600X, 32GB RAM
- **OS**: Arch Linux
- **Test**: Simple JSON endpoint returning `{ message: "Hello World" }`
- **Duration**: 30 seconds per test
- **Concurrency**: 100 connections
- **Tools**: [oha](https://github.com/hatoo/oha) and [wrk](https://github.com/wg/wrk)

### Results (OHA - 30s test)

| Framework              | Requests/sec | Avg Latency | P99 Latency | Success Rate |
| ---------------------- | ------------ | ----------- | ----------- | ------------ |
| **Go Fiber**           | 418,106      | 0.24ms      | 1.25ms      | 100%         |
| **Rust Actix**         | 388,111      | 0.26ms      | 1.74ms      | 100%         |
| **Elysia (Bun)**       | 312,951      | 0.32ms      | 0.88ms      | 100%         |
| **Spring Boot (Java)** | 118,177      | 0.84ms      | 10.94ms     | 100%         |
| **Karin + @Fast**      | 114,434      | 0.87ms      | 1.59ms      | 100%         |
| **Hono (Bun)**         | 101,830      | 0.98ms      | 1.75ms      | 100%         |
| **Karin (Standard)**   | 92,739       | 1.08ms      | 2.34ms      | 100%         |
| **NestJS + Fastify**   | 38,769       | 2.58ms      | 2.89ms      | 100%         |

### Results (WRK - 30s test)

| Framework              | Requests/sec | Avg Latency | Transfer/sec |
| ---------------------- | ------------ | ----------- | ------------ |
| **Rust Actix**         | 511,469      | 0.27ms      | 89.26 MB/s   |
| **Go Fiber**           | 494,988      | 0.31ms      | 86.39 MB/s   |
| **Elysia (Bun)**       | 392,683      | 0.25ms      | 68.53 MB/s   |
| **Spring Boot (Java)** | 136,994      | 1.81ms      | 26.15 MB/s   |
| **Karin + @Fast**      | 109,302      | 0.88ms      | 20.53 MB/s   |
| **Karin (Standard)**   | 103,444      | 0.93ms      | 19.43 MB/s   |
| **Hono (Bun)**         | 96,961       | 0.99ms      | 16.92 MB/s   |
| **NestJS + Fastify**   | 34,454       | 2.85ms      | 8.08 MB/s    |

### Key Takeaways

1.  **Karin is fast** - Significantly faster than NestJS while maintaining similar developer experience
2.  **@Fast decorator** - Using `@Fast()` on routes bypasses guards/pipes/interceptors for ~10% performance boost
3.  **Framework overhead matters** - The difference between Karin and raw Hono shows the cost of DI/decorators

### Important Notes

- ⚠️ **These are synthetic benchmarks** - Real-world performance depends on your database, business logic, and architecture
- ⚠️ **Framework choice should not be based solely on benchmarks** - Consider ecosystem, maturity, team experience, and project requirements
- ⚠️ **NestJS uses Fastify adapter** - Results shown are with Fastify, not Express (which would be slower)
- ⚠️ **Your mileage may vary** - Always benchmark your own use case

---

## Documentation

- [Plugin Lazy Resolution](./docs/PLUGIN_LAZY_RESOLUTION.md) - How to use lazy configuration in plugins
- [Global Filters, Guards & Pipes](./docs/GLOBAL_FILTERS_GUARDS_PIPES.md) - Correct usage patterns
- [Mongoose Error Handling](./docs/MONGOOSE_ERROR_HANDLING.md) - Enterprise-grade error handling
- [Core Tests](./packages/core/test/README.md) - Test suite documentation

---

## Contributing

This is a learning project, and contributions are welcome! Whether you're:

- 🐛 Reporting bugs
- 💡 Suggesting features
- 📖 Improving documentation
- 🔧 Submitting pull requests

All contributions are appreciated!

### Development Setup

```bash
# Clone the repository
git clone https://github.com/jefjesuswt/karin-js
cd karin-js

# Install dependencies
bun install

# Run tests
bun test

# Run playground example
bun examples/playground/src/main.ts
```

### Guidelines

- Write tests for new features
- Follow existing code style
- Update documentation as needed
- Be respectful and constructive

---

## Acknowledgments

Karin draws inspiration from:

- **[NestJS](https://nestjs.com/)** - Decorator patterns and architecture
- **[Hono](https://hono.dev/)** - Lightweight routing and Edge support
- **[H3](https://h3.unjs.io/)** - High-performance HTTP server
- **[Elysia](https://elysiajs.com/)** - Bun-first framework design

Special thanks to the Bun team for creating an amazing runtime!

---

SThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/jefjesuswt">Jeffrey</a> using <strong>Bun</strong> and <strong>Karin</strong>.
</p>
