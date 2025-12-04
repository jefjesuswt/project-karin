import { spawnSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

// 1. Get current version from core package
const corePackagePath = join(process.cwd(), "packages/core/package.json");
const corePackage = JSON.parse(readFileSync(corePackagePath, "utf-8"));
const version = corePackage.version;
const tagName = `v${version}`;

console.log(`🚀 Preparing release for ${tagName}...`);

// 2. Check if tag exists
const checkTag = spawnSync("git", ["tag", "-l", tagName]);
if (checkTag.stdout.toString().trim() === tagName) {
    console.log(`⚠️ Tag ${tagName} already exists. Skipping tag creation.`);
} else {
    // 3. Create Git Tag
    console.log(`🏷️ Creating git tag ${tagName}...`);
    spawnSync("git", ["tag", tagName], { stdio: "inherit" });
    spawnSync("git", ["push", "origin", tagName], { stdio: "inherit" });
}

// 4. Create GitHub Release
// We use 'gh' CLI which is available in GitHub Actions runners
console.log(`📦 Creating GitHub Release ${tagName}...`);

// Use --generate-notes to let GitHub auto-generate the changelog from PRs
const releaseCmd = spawnSync("gh", [
    "release",
    "create",
    tagName,
    "--title",
    tagName,
    "--generate-notes"
], { stdio: "inherit" });

if (releaseCmd.status !== 0) {
    console.error("❌ Failed to create GitHub Release");
    process.exit(1);
}

console.log("✅ GitHub Release created successfully!");
