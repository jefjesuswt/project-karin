import { inject } from "@karin-js/core";

export const DRIZZLE_DB = "DRIZZLE_DB";

export const InjectDrizzle = () => inject(DRIZZLE_DB);
