import { readdirSync, existsSync, readFileSync } from "node:fs";
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
  const pkgJsonPath = join(pkgPath, "package.json");
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));

  const dependencies = [
    ...Object.keys(pkgJson.dependencies || {}),
    ...Object.keys(pkgJson.peerDependencies || {}),
  ];

  console.log(`   - Building @project-karin/${pkg}...`);

  // 1. Generate Types
  const tscProc = Bun.spawnSync(
    [
      "bunx",
      "tsc",
      "--project",
      tsconfigPath,
      "--declaration",
      "--emitDeclarationOnly",
      "--outDir",
      join(pkgPath, "dist"),
    ],
    {
      cwd: pkgPath,
      stdout: "inherit",
      stderr: "inherit",
    }
  );

  if (tscProc.exitCode !== 0) {
    console.error(`❌ Type generation failed for ${pkg}`);
    process.exit(1);
  }

  // 2. Bundle JS
  const result = await Bun.build({
    entrypoints: [join(pkgPath, "index.ts")],
    outdir: join(pkgPath, "dist"),
    target: "bun",
    external: ["*"],
    format: "esm",
  });

  if (!result.success) {
    console.error(`❌ Build failed for ${pkg}`);
    console.error(result.logs);
    process.exit(1);
  }
}

console.log("✅ Build successful.");
