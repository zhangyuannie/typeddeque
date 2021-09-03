#!/usr/bin/env -S deno run --allow-all
import {
  dirname,
  fromFileUrl,
} from "https://deno.land/std@0.106.0/path/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.12.24/mod.js";
import manifest from "../_manifest.ts";

const rootDir = `${dirname(fromFileUrl(import.meta.url))}/..`;
const outDir = `${rootDir}/dist`;

const src: string[] = [];
const includes = new Set(["README.md", "LICENSE"]);
const excludes = new Set(["_manifest.ts"]);
for (const entry of Deno.readDirSync(rootDir)) {
  if (
    entry.isFile &&
    entry.name.endsWith(".ts") &&
    !entry.name.endsWith(".test.ts") &&
    !excludes.has(entry.name)
  ) {
    src.push(entry.name);
  }
}

await Deno.remove(outDir, { recursive: true }).catch(() => {});

const compileCmd =
  `npx -p typescript tsc -t ESNEXT -m commonjs --strict -d --outDir ${outDir}`;
const compile = Deno.run({ cmd: [...compileCmd.split(" "), ...src] });
await compile.status();

const decoder = new TextDecoder();
function removeFromFile(path: string, toRemove: string) {
  const text = decoder.decode(Deno.readFileSync(path)).replaceAll(toRemove, "");
  Deno.writeTextFileSync(path, text);
}

removeFromFile(`${outDir}/mod.js`, ".ts");
removeFromFile(`${outDir}/mod.d.ts`, ".ts");

// write esm bundle
await esbuild.build({
  entryPoints: [`${rootDir}/mod.ts`],
  bundle: true,
  format: "esm",
  outfile: `${outDir}/mod.esm.js`,
});
esbuild.stop();

const packageJson = {
  name: manifest.name,
  version: manifest.version,
  description: "Variable length TypedArray",
  main: "./mod.js",
  module: "./mod.esm.js",
  exports: {
    import: "./mod.esm.js",
    require: "./mod.js",
  },
  types: "./mod.d.ts",
  repository: {
    type: "git",
    url: "git+https://github.com/zhangyuannie/typeddeque.git",
  },
  keywords: ["arraybuffer", "buffer", "uint8array", "queue", "deque", "tcp"],
  author: "Zhangyuan Nie",
  license: manifest.license,
  bugs: {
    url: "https://github.com/zhangyuannie/typeddeque/issues",
  },
  homepage: "https://github.com/zhangyuannie/typeddeque#readme",
  engines: {
    node: ">=12",
  },
};

Deno.writeTextFileSync(
  `${outDir}/package.json`,
  `${JSON.stringify(packageJson, undefined, 2)}\n`,
);

for (const path of includes) {
  Deno.copyFileSync(`${rootDir}/${path}`, `${outDir}/${path}`);
}
