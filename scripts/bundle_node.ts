#!/usr/bin/env -S deno run --allow-all
import {
  fromFileUrl,
  dirname,
} from "https://deno.land/std@0.106.0/path/mod.ts";
import manifest from "../_manifest.ts";

const rootDir = `${dirname(fromFileUrl(import.meta.url))}/..`;
const outDir = `${rootDir}/dist`;

const src: string[] = [];
for (const entry of Deno.readDirSync(rootDir)) {
  if (
    entry.isFile &&
    entry.name.endsWith(".ts") &&
    !entry.name.endsWith(".test.ts")
  ) {
    src.push(entry.name);
  }
}

await Deno.remove(outDir, { recursive: true }).catch(() => {});

const compileCmd = `npx -p typescript tsc -t ESNEXT -m commonjs --strict -d --outDir ${outDir}`;
const compile = Deno.run({ cmd: [...compileCmd.split(" "), ...src] });
await compile.status();

const decoder = new TextDecoder();
function removeFromFile(path: string, toRemove: string) {
  const text = decoder.decode(Deno.readFileSync(path)).replaceAll(toRemove, "");
  Deno.writeTextFileSync(path, text);
}

removeFromFile(`${outDir}/mod.js`, ".ts");
removeFromFile(`${outDir}/mod.d.ts`, ".ts");

const packageJson = {
  name: manifest.name,
  version: manifest.version,
  description: "Variable length TypedArray",
  main: "mod.js",
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

Deno.copyFileSync(`${rootDir}/LICENSE`, `${outDir}/LICENSE`);
