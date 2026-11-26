import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { readExecutionProfile } from "./execution-profile.mjs";

const [command, ...args] = process.argv.slice(2);
if (!["dev", "build"].includes(command)) throw new Error("Expected dev or build.");
const managedLinux = readExecutionProfile() === "managed-linux";
// Stamp the exact checked-out revision into the Worker bundle, not a mutable environment secret.
if (command === "build") {
  let sha = "";
  try { sha = execFileSync("git", ["rev-parse", "HEAD"], {cwd:fileURLToPath(new URL("..",import.meta.url)),encoding:"utf8",stdio:["ignore","pipe","ignore"]}).trim(); } catch {}
  if (!/^[a-f0-9]{40}$/.test(sha)) sha = process.env.CF_PAGES_COMMIT_SHA || process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || "";
  if (!/^[a-f0-9]{40}$/.test(sha)) sha = "unknown";
  writeFileSync(new URL("../lib/release-build.json",import.meta.url), JSON.stringify({release:"R51.6",commit:sha})+"\n");
}

if (managedLinux && command === "build") {
  const result = spawnSync("bash", [
    fileURLToPath(new URL("./build-verified.sh", import.meta.url)), ...args,
  ], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

// Import in this process so the preview owner retains its PID and signals.
const cli = new URL(managedLinux
  ? "../node_modules/vite/bin/vite.js"
  : "../node_modules/vinext/dist/cli.js", import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), command,
  ...(!managedLinux && command === "dev" ? ["--port", "5173"] : []), ...args];
await import(cli.href);
