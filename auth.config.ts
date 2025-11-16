// auth.config.ts
// 🚨 ÚLTIMA CORRECCIÓN DE CÓDIGO NECESARIA PARA NODEMAILER 🚨

import type { AuthConfig } from '@auth/core/types';
import { Role } from '@prisma/client';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
// -----------------------------------------------------------

export function getEmailServer(): string | (Record<string, any>) {
  // Priority: explicit URL via EMAIL_SERVER_URL, then host/port/user/pass, then OAuth2
  if (process.env.EMAIL_SERVER_URL) return process.env.EMAIL_SERVER_URL;

  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  // OAuth2 support (Gmail): set EMAIL_OAUTH_CLIENT_ID, EMAIL_OAUTH_CLIENT_SECRET, EMAIL_OAUTH_REFRESH_TOKEN
  const oauthClientId = process.env.EMAIL_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.EMAIL_OAUTH_CLIENT_SECRET;
  const oauthRefreshToken = process.env.EMAIL_OAUTH_REFRESH_TOKEN;

  if (oauthClientId && oauthClientSecret && oauthRefreshToken && user) {
    const obj: any = {
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
    };
    // In development, allow self-signed certs if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && process.env.EMAIL_ALLOW_INSECURE === 'true') {
      obj.tls = { rejectUnauthorized: false };
    }
    return obj;
  }

  if (host && port) {
    const obj: any = {
      host,
      port: Number(port),
      secure: port === '465' || Number(port) === 465,
      auth: user && pass ? { user, pass } : undefined,
    };
    if (process.env.NODE_ENV !== 'production' && process.env.EMAIL_ALLOW_INSECURE === 'true') {
      obj.tls = { rejectUnauthorized: false };
    }
    return obj;
  }

  // Fallback: let provider decide (may error)
  return '';
}

export const authConfig: AuthConfig = {
  // Habilitar debug en desarrollo para ver trazas completas
  debug: process.env.NODE_ENV !== 'production',

  // Forzar cookies no 'secure' en desarrollo para que funcionen en http://localhost
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  
  // Nota: la autorización a nivel de rutas se delega al middleware edge-safe.
  
  // 2. El objeto 'callbacks' solo contiene funciones de ciclo de vida
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role as Role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    verifyRequest: '/login/verificar',
    error: '/login/error',
  },

  // 3. LA CORRECCIÓN CRÍTICA: Pasamos la configuración SMTP como objeto y solo
  //    instanciamos el EmailProvider si hay configuración SMTP válida para evitar
  //    el error de Nodemailer cuando no hay SMTP configurado.
  providers: (() => {
    const server = getEmailServer();
    if (!server) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[auth][warn] No SMTP config found — EmailProvider disabled. Set EMAIL_SERVER_* or EMAIL_SERVER_URL to enable magic links.');
      }
      return [];
    }

    return [
      EmailProvider({
        server,
        from: process.env.EMAIL_FROM,
        // Custom sender to log the plain token and still send the email via nodemailer
        async sendVerificationRequest(params: any) {
          const { identifier, url, provider, token } = params;
          try {
            console.debug('[auth][debug] sendVerificationRequest', JSON.stringify({ identifier, token, url }));
          } catch {}

          // In dev, send actual email so you can click the link. Uses provider.server
          try {
            // @ts-ignore - nodemailer has no TS types installed in this repo; treat as any
            const nodemailer: any = (await import('nodemailer')).default;
            const transporter = nodemailer.createTransport((provider as any).server as any);
            const result = await transporter.sendMail({
              to: identifier,
              from: (provider as any).from,
              subject: `Tu enlace de acceso a ${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'KLINIK-MAT'}`,
              text: `Usa este enlace para acceder: ${url}\n\nSi no lo pediste, ignora este correo.`,
              html: `<p>Usa este enlace para acceder: <a href="${url}">${url}</a></p>\n<p>Si no lo pediste, ignora este correo.</p>`,
            });
            console.debug('[auth][debug] sendVerificationRequest -> email sent', { messageId: result?.messageId });
          } catch (e: any) {
            console.debug('[auth][debug] sendVerificationRequest -> email send error', { message: e?.message });
          }
        },
      }),
    ];
  })(),
};