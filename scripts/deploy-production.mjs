import { execFileSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const verifyOnly = process.argv.includes("--verify");
const timeoutMs = 5 * 60 * 1000;

function run(command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function git(...args) {
  return run("git", args).trim();
}

function latestForCommit(sha) {
  const output = run("npx", ["vercel", "ls", "--format", "json"]);
  const jsonStart = output.indexOf("{");
  if (jsonStart < 0) throw new Error("Vercel CLI לא החזיר נתוני פריסות בפורמט JSON.");
  const result = JSON.parse(output.slice(jsonStart));
  return result.deployments?.find((deployment) =>
    deployment.target === "production" && deployment.meta?.githubCommitSha === sha,
  );
}

function report(deployment) {
  const url = deployment.url.startsWith("http") ? deployment.url : `https://${deployment.url}`;
  console.log(`Production ${deployment.state}: ${url}`);
  if (deployment.state !== "READY") process.exitCode = 1;
}

async function main() {
  if (git("branch", "--show-current") !== "main") {
    throw new Error("פריסת production מותרת מהענף main בלבד.");
  }
  if (!verifyOnly && git("status", "--porcelain")) {
    throw new Error("יש שינויים שלא נשמרו ב־Git. בצעו commit לפני הפריסה.");
  }

  const sha = git("rev-parse", "HEAD");
  if (!verifyOnly) {
    console.log(`דוחף ${sha.slice(0, 7)} ל־origin/main; Vercel יפרוס דרך חיבור GitHub.`);
    run("git", ["push", "origin", "main"]);
    console.log("ה־push ל־origin/main הסתיים בהצלחה.");
  }

  const deadline = Date.now() + timeoutMs;
  while (true) {
    const deployment = latestForCommit(sha);
    if (deployment?.state === "READY" || deployment?.state === "ERROR" || deployment?.state === "CANCELED") {
      report(deployment);
      return;
    }
    if (Date.now() >= deadline) {
      throw new Error(`Vercel עדיין לא דיווח על השלמת הפריסה ל־${sha.slice(0, 7)} לאחר 5 דקות.`);
    }
    console.log("הפריסה בבנייה; בדיקה חוזרת בעוד 10 שניות…");
    await delay(10_000);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "שגיאה בפריסת production.");
  process.exitCode = 1;
});
