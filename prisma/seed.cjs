/* prisma/seed.cjs */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const data = require('./cases.json');

const difMap = { Alta: 3, Media: 2, Baja: 1 };

async function main() {
  console.log(`🩺 Cargando ${data.length} casos clínicos...`);
  await prisma.case.deleteMany();

  for (const c of data) {
    const dificultad =
      typeof c.dificultad === 'number' ? c.dificultad : (difMap[c.dificultad] ?? 2);

    // Validación: imprime 1 paso para verificar
    if (!c.pasos || !Array.isArray(c.pasos)) {
      console.warn(`⚠️ Caso ${c.id} no tiene pasos válidos`);
    }

    await prisma.case.create({
      data: {
        id: c.id,
        titulo: c.titulo ?? 'Caso sin título',
        area: c.modulo ?? 'General',
        dificultad,
        resumen: c.vigneta?.slice(0, 250) ?? null,
        vignette: c.vigneta ?? null,
        contenido: {
          pasos: c.pasos ?? [],
          referencias: c.referencias ?? [],
        },
        isPublic: true,
      },
    });
  }

  console.log('✅ Seed completado correctamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });