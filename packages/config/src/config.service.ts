import { Service } from "@project-karin/core";

@Service()
export class ConfigService<T = any> {
  private configMap: Record<string, any> = {};

  /**
   * Load configuration from an object.
   * This is usually called by the ConfigPlugin during initialization.
   */
  loadFromObject(env: Record<string, any>) {
    this.configMap = { ...env };
  }

  /**
   * Get a configuration value.
   */
  get<K extends keyof T>(key: K): T[K] | undefined;
  get<R = any>(key: string): R | undefined;
  get(key: any): any {
    return this.configMap[key];
  }

  /**
   * Get a configuration value or throw if missing.
   */
  getOrThrow<K extends keyof T>(key: K): NonNullable<T[K]>;
  getOrThrow<R = any>(key: string): R;
  getOrThrow(key: any): any {
    const value = this.get(key);
    if (value === undefined || value === null || value === "") {
      throw new Error(`Missing required configuration key: "${String(key)}"`);
    }
    return value;
  }

  /**
   * Get all configuration values.
   */
  getAll(): T {
    return this.configMap as T;
  }
}
