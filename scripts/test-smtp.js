// scripts/test-smtp.js
// Verifica la conexión SMTP configurada en .env.local y envía un correo de prueba.
// Ejecutar: node scripts/test-smtp.js

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

function buildServerConfig() {
  if (process.env.EMAIL_SERVER_URL) return process.env.EMAIL_SERVER_URL;

  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  const oauthClientId = process.env.EMAIL_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.EMAIL_OAUTH_CLIENT_SECRET;
  const oauthRefreshToken = process.env.EMAIL_OAUTH_REFRESH_TOKEN;

  if (oauthClientId && oauthClientSecret && oauthRefreshToken && user) {
    return {
      host: host || 'smtp.gmail.com',
      port: port ? Number(port) : 465,
      secure: port === '465' || Number(port) === 465,
      auth: {
        type: 'OAuth2',
        user,
        clientId: oauthClientId,
        clientSecret: oauthClientSecret,
        refreshToken: oauthRefreshToken,
      },
      tls: process.env.NODE_ENV !== 'production' && process.env.EMAIL_ALLOW_INSECURE === 'true' ? { rejectUnauthorized: false } : undefined,
    };
  }

  if (host && port) {
    return {
      host,
      port: Number(port),
      secure: port === '465' || Number(port) === 465,
      auth: user && pass ? { user, pass } : undefined,
      tls: process.env.NODE_ENV !== 'production' && process.env.EMAIL_ALLOW_INSECURE === 'true' ? { rejectUnauthorized: false } : undefined,
    };
  }

  return null;
}

async function main() {
  const server = buildServerConfig();
  if (!server) {
    console.error('No SMTP configuration encontrada en .env.local. Define EMAIL_SERVER_URL o EMAIL_SERVER_HOST/PORT etc.');
    process.exit(1);
  }

  console.log('Usando configuración SMTP:', typeof server === 'string' ? server : JSON.stringify({ host: server.host, port: server.port, secure: server.secure }));

  const transporter = nodemailer.createTransport(server);

  try {
    console.log('Verificando conexión SMTP...');
    await transporter.verify();
    console.log('Conexión SMTP OK');

    const to = process.env.TEST_EMAIL_TO || process.env.EMAIL_FROM || 'test@example.com';
    const from = process.env.EMAIL_FROM || 'no-reply@example.com';

    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Prueba SMTP - KlinikMat',
      text: 'Correo de prueba enviado desde scripts/test-smtp.js',
      html: '<p>Correo de prueba enviado desde <b>scripts/test-smtp.js</b></p>',
    });

    console.log('Mensaje enviado, id:', info.messageId || info.response);
    if (nodemailer.getTestMessageUrl) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('Preview URL:', preview);
    }
  } catch (err) {
    console.error('Error verificando/enviando via SMTP:', err);
    process.exit(1);
  }
}

main();
