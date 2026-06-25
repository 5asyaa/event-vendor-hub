/**
 * start-all.js — Entry point untuk Railway.
 * Menjalankan semua microservice dalam satu proses menggunakan child_process.
 * Setiap service di-spawn dari direktorinya sendiri agar dotenv & require() bekerja benar.
 */
const { spawn } = require("child_process");
const path = require("path");

const services = [
  { name: "auth-service",    dir: "microservices/auth-service",    port: 3001 },
  { name: "vendor-service",  dir: "microservices/vendor-service",  port: 3002 },
  { name: "booking-service", dir: "microservices/booking-service", port: 3003 },
  { name: "payment-service", dir: "microservices/payment-service", port: 3004 },
  { name: "review-service",  dir: "microservices/review-service",  port: 3005 },
  { name: "api-gateway",     dir: "microservices/api-gateway",     port: null  }, // pakai process.env.PORT
];

services.forEach(({ name, dir, port }) => {
  const cwd = path.resolve(__dirname, dir);
  const env = {
    ...process.env,
    // Override PORT hanya untuk service internal (bukan gateway)
    // Gateway pakai process.env.PORT dari Railway
    ...(port ? { PORT: String(port) } : {})
  };

  const child = spawn("node", ["server.js"], { cwd, env, stdio: "pipe" });

  child.stdout.on("data", (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`[${name}][ERR] ${data}`);
  });

  child.on("exit", (code) => {
    console.error(`[${name}] exited with code ${code}`);
  });
});

console.log("All services spawned. API Gateway is the public entry point.");
