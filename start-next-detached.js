const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const node = "C:\\Program Files\\nodejs\\node.exe";
const root = "D:\\Cosas_imco\\metricas_rs";
const out = fs.openSync(path.join(root, "next-runner.out.log"), "a");
const err = fs.openSync(path.join(root, "next-runner.err.log"), "a");

const child = spawn(node, ["next-runner.js"], {
  cwd: root,
  detached: true,
  windowsHide: true,
  stdio: ["ignore", out, err],
  env: {
    ...process.env,
    PATH: `C:\\Program Files\\nodejs;${process.env.PATH || ""}`,
    NODE_OPTIONS: "--use-system-ca"
  }
});

child.unref();
console.log(child.pid);
