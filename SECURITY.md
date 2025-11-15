Resguardos de seguridad aplicados

Resumen de cambios aplicados para endurecer la autenticación y preparación para producción:

- Tokens de verificación (magic links): ahora se almacenan como hash SHA-256 en la base de datos (campo `verification_tokens.token`).
  - `auth.ts` sobrescribe `createVerificationToken` para guardar `sha256(token)` y `useVerificationToken` para comparar `sha256(incoming)`.
  - Esto evita que tokens en texto claro queden en la BD.

- Endpoints de desarrollo (`/api/debug/*`): ahora requieren dos condiciones para ejecutarse:
  - `ENABLE_NEXTAUTH_DEV=true` en el entorno
  - cabecera HTTP `x-nextauth-dev-key` con el valor de `NEXTAUTH_DEV_KEY`.
  - Además se movieron copias de los helpers como scripts en `scripts/dev_helpers/`.
  - Recomendación: eliminar estas rutas antes de exponer la app en producción (por defecto están deshabilitadas si no configuras las variables).

- Middleware: la protección de rutas se realizó con un `middleware.ts` edge-safe que comprueba la cookie de sesión, evitando arrastrar dependencias Node-only al runtime Edge.

- Cliente: `LoginScreenClient` ya no llama a endpoints dev por defecto; utiliza el flujo de `signIn('email')`.

- Mailer: `auth.config.ts` usa import dinámico de `nodemailer` dentro de `sendVerificationRequest` para evitar que `nodemailer` se incluya en bundles Edge.

Pasos recomendados antes de producción

1. Ejecutar migraciones prisma tras revisar el esquema:

```bash
npx prisma migrate dev --name secure-verification-token
# o si prefieres solo sincronizar (NO recomendado para producción):
# npx prisma db push
npx prisma generate
```

2. Configurar variables de entorno en producción:
- `DATABASE_URL`
- `NEXTAUTH_URL` y `NEXT_PUBLIC_SITE_URL`
- `NEXTAUTH_SECRET`
- `EMAIL_SERVER_URL` o `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

3. Asegurar que `ENABLE_NEXTAUTH_DEV` no esté activo en producción (no establecerlo o dejarlo en `false`).

4. (Opcional) Instalar tipos de nodemailer en desarrollo para eliminar warnings TS:

```bash
npm i -D @types/nodemailer
```

5. Revisar y eliminar `scripts/dev_helpers` antes de crear el bundle final, si quieres evitar dejar helpers en el repositorio.

Notas

- Los tokens que ya existieran en la DB (anteriores al cambio) quedarán en texto claro hasta que se consuman o se les aplique migración. Recomendación: eliminar filas antiguas de `verification_tokens` para forzar la recreación segura.
- Si necesitas que yo prepare un script de migración que convierta tokens existentes a hashes, me indicas y lo creo (requiere que tengas acceso a los tokens en texto claro — si no se almacenan, no es posible convertirlos).
