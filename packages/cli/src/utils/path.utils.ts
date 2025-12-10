import { existsSync } from "fs";
import { join } from "path";

export class PathUtils {
  static findSrcDir(cwd: string): string {
    const possibleSrc = join(cwd, "src");

    if (this.exists(possibleSrc)) {
      return possibleSrc;
    }

    throw new Error(
      "Could not find 'src' folder. Please run this command from the root of your Karin project."
    );
  }

  static exists(path: string): boolean {
    return existsSync(path);
  }
}
