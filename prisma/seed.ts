// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'; 
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Empezando el proceso de seeding de KLINIK-MAT...');

  // 1. Limpiar la base de datos (IMPORTANTE: Mantenemos esta limpieza para un entorno de desarrollo/prueba)
  // El orden es importante para evitar errores de clave foránea.
  console.log('🧹 Limpiando datos existentes...');
  await prisma.studentResult.deleteMany(); // Limpia resultados antes que usuarios
  await prisma.session.deleteMany();       // Limpia sesiones de Auth.js
  await prisma.account.deleteMany();       // Limpia cuentas de Auth.js
  await prisma.verificationToken.deleteMany(); // Limpia tokens de Auth.js
  
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.case.deleteMany();
  await prisma.minsalNorm.deleteMany();
  await prisma.user.deleteMany(); 
  console.log('Datos de desarrollo limpios.');


  // 2. Crear un usuario administrador (La clave para la seguridad)
  const ADMIN_PASSWORD = 'admin123';
  const hashedPassword = await hash(ADMIN_PASSWORD, 12); // Hash seguro con costo 12
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@klinik-mat.cl',
      name: 'Admin Supervisor',
      passwordHash: hashedPassword, 
      role: Role.ADMIN, // Le asignamos el rol de administrador
    },
  });
  console.log(👤 Creado usuario administrador: ${adminUser.email} (Contraseña: ${ADMIN_PASSWORD}));


  // 3. Crear Normas MINSAL
  const normaMEC = await prisma.minsalNorm.create({
    data: {
      name: 'Criterios de Elegibilidad Médica para el Uso de Anticonceptivos (MEC)',
      code: 'OMS-MEC-5',
    },
  });

  const normaFertilidad = await prisma.minsalNorm.create({
    data: {
      name: 'Normas Nacionales sobre Regulación de la Fertilidad',
      code: 'MINSAL-FERT-2018',
    },
  });
  console.log('📜 Creadas normas MINSAL de ejemplo.');


  // 4. Crear un Caso Clínico completo con sus relaciones
  const casoMigrana = await prisma.case.create({
    data: {
      title: 'Anticoncepción en paciente con migraña con aura',
      area: 'Anticoncepción',
      difficulty: 4,
      summary: 'Mujer de 22 años con diagnóstico de migraña con aura busca método anticonceptivo LARC de alta eficacia.',
      isPublic: true,
      vignette: 'Mujer de 22 años, estudiante universitaria, vive en zona rural. Diagnosticada por neurólogo con migraña con aura (escotomas y fosfenos). No fuma. Desea un método LARC de altísima eficacia. Comenta que su amiga usa combinados y le va excelente.',
      norms: {
        connect: [{ id: normaMEC.id }, { id: normaFertilidad.id }],
      },
      questions: {
        create: [
          {
            order: 1,
            text: '¿Cuál es la opción más segura y alineada a su preferencia (LARC) según los criterios MEC de la OMS?',
            options: {
              create: [
                { text: 'ACO combinado (etinilestradiol + progestina).', isCorrect: false, feedback: 'Contraindicado (MEC Cat. 4) por aumento del riesgo de ACV isquémico. (Riesgo vascular > beneficio anticonceptivo).' },
                { text: 'Implante subdérmico de etonogestrel.', isCorrect: true, feedback: 'Correcto. LARC altamente eficaz y sin estrógeno (MEC Cat. 1). Es la mejor opción para reducir riesgo vascular.' },
                { text: 'DIU de Cobre (TCu 380A).', isCorrect: false, feedback: 'Es seguro (MEC 1), pero la paciente solicitó un método de alta eficacia LARC, este no cumple con esa expectativa.' },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(🏥 Creado caso clínico: "${casoMigrana.title}");

  console.log('✅ Seeding completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el proceso de seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});