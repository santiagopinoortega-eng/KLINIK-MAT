// app/casos/data.ts
// Fuente de respaldo (solo si la base está offline)
import backup from "@/prisma/cases.json";

// Exporta solo en caso de error en la conexión
export const fallbackCases = backup;