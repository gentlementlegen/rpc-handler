import esbuild from "esbuild";
import path from "path";
import * as fs from "fs";

const typescriptEntries = ["index.ts"];
export const entries = [...typescriptEntries];

export const esBuildContext: esbuild.BuildOptions = {
  entryPoints: entries,
  bundle: true,
  outdir: "dist",
};

async function main() {
  try {
    await buildForEnvironments();
    await buildIndex();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();

async function buildForEnvironments() {
  ensureDistDir();

  await esbuild
    .build({
      ...esBuildContext,
      tsconfig: "tsconfig.node.json",
      platform: "node",
      outdir: "dist/cjs",
      format: "cjs",
    })
    .then(() => {
      console.log("Node.js esbuild complete");
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
  esbuild
    .build({
      ...esBuildContext,
      tsconfig: "tsconfig.web.json",
      platform: "browser",
      outdir: "dist/esm",
      format: "esm",
    })
    .then(() => {
      console.log("Frontend esbuild complete");
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

async function buildIndex() {
  await esbuild.build({
    entryPoints: ["index.ts"],
    bundle: true,
    format: "cjs",
    outfile: "dist/index.js",
  });

  console.log("Index build complete.");
}

function createEnvDefines(generatedAtBuild: Record<string, unknown>): Record<string, string> {
  const defines: Record<string, string> = {};
  Object.keys(generatedAtBuild).forEach((key) => {
    defines[key] = JSON.stringify(generatedAtBuild[key]);
  });

  return defines;
}

function ensureDistDir() {
  const distPath = path.resolve(__dirname, "dist");
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
}
