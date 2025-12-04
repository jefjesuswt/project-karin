import { existsSync } from "fs";
import { join } from "path";

export function findSrcDir(cwd: string): string {
  const possibleSrc = join(cwd, "src");

  if (existsSync(possibleSrc)) {
    return possibleSrc;
  }

  throw new Error(
    "Could not find 'src' folder. Please run this command from the root of your Karin-JS project."
  );
}
