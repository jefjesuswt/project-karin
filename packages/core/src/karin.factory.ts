import "reflect-metadata";
import { CONTROLLER_METADATA } from "./decorators/constants";
import { Logger } from "./logger";
import { isConstructor } from "./utils/type-guards";
import { KarinApplication } from "./karin.application";
import type { IHttpAdapter } from "./interfaces";
import { RouterExplorer } from "./router/router-explorer";
import { DICache } from "./router/di-cache";

import type {
  KarinPlugin,
  ExceptionFilter,
  CanActivate,
  PipeTransform,
  Type,
  KarinController
} from "./interfaces";

export interface KarinFactoryOptions {
  scan?: boolean | string;
  cwd?: string;
  controllers?: KarinController[];
  strict?: boolean;
  plugins?: KarinPlugin[];
  globalFilters?: Array<ExceptionFilter | Type<ExceptionFilter>>;
  globalGuards?: Array<CanActivate | Type<CanActivate>>;
  globalPipes?: Array<PipeTransform | Type<PipeTransform>>;
}

export class KarinFactory {
  private static logger = new Logger("KarinFactory");

  static async create(
    adapter: IHttpAdapter,
    options: KarinFactoryOptions = {}
  ): Promise<KarinApplication> {

    try {
      let root = "/";

      if (options.scan !== false) {
        root = options.cwd ?? (await KarinFactory.findProjectRoot());
      }

      // 1. Initialize application and explorer
      const app = new KarinApplication(adapter, root);
      const explorer = new RouterExplorer(adapter);

      // 2. Register plugins
      if (options.plugins) {
        for (const plugin of options.plugins) {
          await app.use(plugin);
        }
      }

      // 3. Register global components
      if (options.globalFilters) {
        const filters = options.globalFilters.map((item) =>
          isConstructor(item) ? (DICache.resolve(item) as ExceptionFilter) : item
        );
        app.useGlobalFilters(...filters);
      }
      if (options.globalGuards) {
        const guards = options.globalGuards.map((item) =>
          isConstructor(item) ? (DICache.resolve(item) as CanActivate) : item
        );
        app.useGlobalGuards(...guards);
      }
      if (options.globalPipes) {
        const pipes = options.globalPipes.map((item) =>
          isConstructor(item) ? (DICache.resolve(item) as PipeTransform) : item
        );
        app.useGlobalPipes(...pipes);
      }

      // 4. Register manual controllers
      if (options.controllers && options.controllers.length > 0) {
        this.logger.info(
          `Registering ${options.controllers.length} manual controllers`
        );
        for (const ControllerClass of options.controllers) {
          if (isConstructor(ControllerClass)) {
            explorer.explore(app, ControllerClass);
          }
        }

        if (!options.scan) {
          return app;
        }
      }

      // 5. Auto-scan controllers (if enabled)
      if (options.scan !== false) {
        await this.scanControllers(
          root,
          options.scan,
          explorer,
          app,
          options.strict
        );
      }

      return app;
    } catch (error: any) {
      this.logger.error(`Failed to start application: ${error.message}`);
      if (typeof process !== "undefined" && process.exit) {
        process.exit(1);
      }
      throw error;
    }
  }

  private static async scanControllers(
    root: string,
    scanOption: boolean | string | undefined,
    explorer: RouterExplorer,
    app: KarinApplication,
    strict?: boolean
  ) {
    let join: any;
    try {
      // Dynamic import for 'path' to support edge environments where 'path' might be polyfilled or restricted
      const pathMod = await import("path");
      join = pathMod.join;
    } catch {
      this.logger.warn("Path module not available (Edge environment). Skipping scan.");
      return;
    }

    const scanPath =
      typeof scanOption === "string"
        ? scanOption
        : join("src", "**", "*.controller.ts");

    this.logger.info(`Scanning files in: ${scanPath}...`);

    try {
      if (typeof Bun !== "undefined") {
        // Optimized scanning for Bun runtime
        const bunPkg = "bun";
        const { Glob } = await import(bunPkg);

        const globScanner = new Glob(scanPath);

        for await (const file of globScanner.scan(root)) {
          const absolutePath = join(root, file);
          await this.loadModule(absolutePath, explorer, app, strict);
        }
      } else {
        // Fallback or skip for other environments (e.g. Node/Deno)
        this.logger.warn(
          "Auto-scan is currently optimized for Bun runtime. Skipping scan."
        );
      }
    } catch (e: any) {
      this.logger.warn(
        `File scanning skipped/failed (likely Serverless environment): ${e.message}`
      );
    }
  }

  private static async loadModule(
    path: string,
    explorer: RouterExplorer,
    app: KarinApplication,
    strict?: boolean
  ) {
    try {
      const module = await import(path);
      for (const key of Object.keys(module)) {
        const CandidateClass = module[key];
        // Check if the exported member is a class and has @Controller metadata
        if (
          isConstructor(CandidateClass) &&
          Reflect.hasMetadata(CONTROLLER_METADATA, CandidateClass)
        ) {
          explorer.explore(app, CandidateClass);
        }
      }
    } catch (error: any) {
      this.logger.error(`Error loading ${path}: ${error.message}`);
      if (strict) throw error;
    }
  }

  private static async findProjectRoot(): Promise<string> {
    try {
      const { join, dirname } = await import("path");
      const { existsSync } = await import("fs");

      if (typeof Bun !== "undefined" && Bun.main) {
        let currentDir = dirname(Bun.main);
        while (currentDir !== "/" && currentDir !== ".") {
          if (existsSync(join(currentDir, "package.json"))) {
            return currentDir;
          }
          const parent = dirname(currentDir);
          if (parent === currentDir) break;
          currentDir = parent;
        }
        return dirname(Bun.main);
      }
      if (typeof process !== "undefined" && process.cwd) {
        return process.cwd();
      }
      return "/";
    } catch {
      return "/";
    }
  }
}