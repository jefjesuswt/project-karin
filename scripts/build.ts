import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const packagesDir = join(process.cwd(), "packages");
const allPackages = readdirSync(packagesDir).filter((p) =>
  existsSync(join(packagesDir, p, "package.json"))
);

const priority = ["core", "config"];
const others = allPackages.filter((p) => !priority.includes(p));
const packages = [...priority, ...others];

console.log("📦 Building packages (JS + Types)...");

for (const pkg of packages) {
  const pkgPath = join(packagesDir, pkg);
  const tsconfigPath = join(pkgPath, "tsconfig.json");

  console.log(`   - Building @karin-js/${pkg}...`);

  // ✅ CRÍTICO: Usar --declarationDir para forzar output correcto
  const proc = Bun.spawnSync(
    [
      "bunx",
      "tsc",
      "--project",
      tsconfigPath,
      "--declaration",
      "--outDir",
      join(pkgPath, "dist"),
    ],
    {
      cwd: pkgPath, // ← CAMBIO: Ejecutar desde el paquete
      stdout: "inherit",
      stderr: "inherit",
    }
  );

  if (proc.exitCode !== 0) {
    console.error(`❌ Build failed for ${pkg}`);
    process.exit(1);
  }
}

console.log("✅ Build successful.");
