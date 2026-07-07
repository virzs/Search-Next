import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const services = [
  {
    name: "api",
    args: ["--filter", "search-next-api", "dev"],
  },
  {
    name: "web",
    args: ["--filter", "search-next-web", "dev"],
  },
  {
    name: "admin",
    args: ["--filter", "search-next-admin", "dev"],
  },
];

const children = new Set();
let stopping = false;

const stopAll = (signal = "SIGTERM") => {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
};

const exitWhenDone = () => {
  if (children.size === 0) process.exit(process.exitCode ?? 0);
};

for (const service of services) {
  console.log(`[dev:all] starting ${service.name}: ${pnpm} ${service.args.join(" ")}`);

  const child = spawn(pnpm, service.args, {
    cwd: root,
    env: process.env,
    shell: false,
    stdio: "inherit",
  });

  children.add(child);

  child.on("error", (error) => {
    if (!stopping) {
      console.error(`[dev:all] ${service.name} failed to start: ${error.message}`);
      process.exitCode = 1;
      stopAll();
    }
  });

  child.on("close", (code, signal) => {
    children.delete(child);

    if (!stopping) {
      const reason = signal ? `signal ${signal}` : `exit code ${code}`;
      console.error(`[dev:all] ${service.name} stopped with ${reason}; stopping other services.`);
      process.exitCode = code ?? (signal ? 1 : 0);
      stopAll();
    }

    exitWhenDone();
  });
}

process.on("SIGINT", () => {
  process.exitCode = 130;
  stopAll("SIGINT");
});

process.on("SIGTERM", () => {
  process.exitCode = 143;
  stopAll("SIGTERM");
});
