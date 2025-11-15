// scripts/test-email-ethereal.js
// Prueba de envío de correo con Ethereal (no requiere cuenta)
// Ejecutar: node scripts/test-email-ethereal.js

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Cargamos .env.local si existe, si no cae al .env
if (require('fs').existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

async function main() {
  console.log('Creando cuenta de prueba en Ethereal...');
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const to = process.env.TEST_EMAIL_TO || process.env.EMAIL_FROM || 'test@example.com';
  const from = process.env.EMAIL_FROM || 'no-reply@example.com';

  console.log('Enviando correo de prueba a:', to);

  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Prueba de correo (Ethereal) - KlinikMat',
    text: 'Este es un correo de prueba enviado desde Ethereal para verificar la funcionalidad de envío en desarrollo.',
    html: '<p>Este es un <b>correo de prueba</b> enviado desde Ethereal para verificar la funcionalidad de envío en desarrollo.</p>',
  });

  console.log('Mensaje enviado, id:', info.messageId);
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log('URL de previsualización (abre en el navegador):', preview);
  } else {
    console.log('No se obtuvo URL de previsualización. Revisa la respuesta de SMTP:', info);
  }
}

main().catch((err) => {
  console.error('Error al enviar correo de prueba:', err);
  process.exit(1);
});
