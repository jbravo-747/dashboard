const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = "D:\\Cosas_imco\\metricas_rs";
const node = "C:\\Program Files\\nodejs\\node.exe";
const out = fs.createWriteStream(path.join(root, "next-prod.out.log"), { flags: "a" });
const err = fs.createWriteStream(path.join(root, "next-prod.err.log"), { flags: "a" });

const child = spawn(node, ["node_modules\\next\\dist\\bin\\next", "start"], {
  cwd: root,
  windowsHide: true,
  stdio: ["pipe", "pipe", "pipe"],
  env: {
    ...process.env,
    PATH: `C:\\Program Files\\nodejs;${process.env.PATH || ""}`,
    NODE_OPTIONS: "--use-system-ca"
  }
});

child.stdout.pipe(out);
child.stderr.pipe(err);
child.on("exit", (code, signal) => {
  err.write(`\nNext exited with code=${code} signal=${signal}\n`);
  process.exit(code || 0);
});

setInterval(() => {}, 60_000);
