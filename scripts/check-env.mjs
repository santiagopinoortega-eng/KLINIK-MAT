// scripts/check-env.mjs
const required = ["DATABASE_URL"];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`❌ Faltan variables de entorno: ${missing.join(", ")}`);
  console.error("Crea .env (o define Codespaces/Vercel secrets). Ejemplo en .env.example");
  process.exit(1);
} else {
  console.log("✅ Variables de entorno OK");
}