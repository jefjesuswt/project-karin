import { inject } from "@karin-js/core";

export const REDIS_CLIENT_TOKEN = "KARIN_REDIS_CLIENT";


export function InjectRedis() {
  return inject(REDIS_CLIENT_TOKEN);
}
