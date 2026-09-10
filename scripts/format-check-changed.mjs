import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const FORMATTABLE = /\.(ts|tsx|js|jsx|mjs|mts|cjs|cts|json|css|md)$/;

function gitFiles(args) {
  return execFileSync("git", args, { encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const changed = new Set([
  ...gitFiles(["diff", "--name-only", "--diff-filter=ACMR", "HEAD"]),
  ...gitFiles(["diff", "--name-only", "--diff-filter=ACMR", "--cached"]),
  ...gitFiles(["ls-files", "--others", "--exclude-standard"]),
]);

const files = [...changed].filter((file) => FORMATTABLE.test(file));

if (files.length === 0) {
  console.log("format:check:changed — nenhum arquivo alterado, nada a verificar.");
  process.exit(0);
}

console.log(`format:check:changed — verificando ${files.length} arquivo(s) alterado(s):`);
for (const file of files) console.log(`  ${file}`);

const prettierBin = require.resolve("prettier/bin/prettier.cjs");

try {
  execFileSync(process.execPath, [prettierBin, "--check", ...files], { stdio: "inherit" });
} catch {
  process.exitCode = 1;
}
