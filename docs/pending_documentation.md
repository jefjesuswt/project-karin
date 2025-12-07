# Documentación Pendiente

Este archivo sirve como un registro temporal de características, configuraciones y comportamientos que se han descubierto o implementado y que necesitan ser agregados a la documentación oficial de KarinJS.

## Platform Hono - Cloudflare Workers

### Habilitar CORS

Para habilitar CORS, se debe instanciar el adaptador HTTP (Hono o H3) manualmente, configurar CORS y luego pasarlo a la fábrica (`KarinFactory`). Esto aplica tanto para entornos **Serverless** como para **Servidores Tradicionales**.

#### 1. Platform Hono

El `HonoAdapter` permite pasar opciones de configuración a `enableCors()`, las cuales son pasadas directamente al middleware de CORS de Hono.

**Serverless (Cloudflare Workers, etc.):**
```typescript
import { HonoAdapter } from "@project-karin/platform-hono";
import { KarinFactory } from "@project-karin/core";

const adapter = new HonoAdapter();
adapter.enableCors({
  origin: ["https://mi-dominio.com", "http://localhost:5173"],
  allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT"],
});

const app = KarinFactory.serverless(adapter, {
  controllers: [/* ... */],
  // ...
});

export default app;
```

**Servidor Tradicional (Bun, Node):**
```typescript
import { HonoAdapter } from "@project-karin/platform-hono";
import { KarinFactory } from "@project-karin/core";

async function bootstrap() {
  const adapter = new HonoAdapter();
  adapter.enableCors(); // Configuración por defecto

  const app = await KarinFactory.create(adapter, {
    controllers: [/* ... */],
    // ...
  });

  app.listen(3000);
}
bootstrap();
```

#### 2. Platform H3

El `H3Adapter` también soporta CORS mediante `enableCors()`. Actualmente, este método habilita CORS con una configuración permisiva por defecto (`origin: "*"`) y no acepta opciones de personalización en esta versión.

**Serverless (Nitro, etc.):**
```typescript
import { H3Adapter } from "@project-karin/platform-h3";
import { KarinFactory } from "@project-karin/core";

const adapter = new H3Adapter();
adapter.enableCors();

const app = KarinFactory.serverless(adapter, {
  controllers: [/* ... */],
  // ...
});

export default app;
```

**Servidor Tradicional:**
```typescript
import { H3Adapter } from "@project-karin/platform-h3";
import { KarinFactory } from "@project-karin/core";

async function bootstrap() {
  const adapter = new H3Adapter();
  adapter.enableCors();

  const app = await KarinFactory.create(adapter, {
    controllers: [/* ... */],
    // ...
  });

  app.listen(3000);
}
bootstrap();
```

## Auth Plugin - Lazy Configuration

### Configuración Lazy para Secretos (JwtPlugin)

En entornos donde la configuración se carga de manera asíncrona o depende de variables de entorno que no están disponibles inmediatamente al momento de la instanciación de la clase (como en Cloudflare Workers o cuando se usa `ConfigPlugin` de manera dependiente), es posible pasar una función `() => string` para el `secret` en `JwtPlugin`.

Esto asegura que el valor del secreto se resuelva solo cuando el plugin es instanciado por el framework, momento en el cual el `ConfigPlugin` ya habrá cargado las variables de entorno.

**Ejemplo:**

```typescript
import { JwtPlugin } from "@project-karin/auth";
import { ConfigPlugin } from "@project-karin/config";

const config = new ConfigPlugin();

const jwt = new JwtPlugin({
  // Se pasa una función en lugar de un string directo
  secret: () => config.get("JWT_SECRET"),
  signOptions: {
    expiresIn: "1d",
  },
});

const app = KarinFactory.serverless(adapter, {
  plugins: [config, jwt, /* ... */],
  // ...
});
```

Este patrón es similar al utilizado en `RedisPlugin` y `DrizzlePlugin` para sus credenciales.
