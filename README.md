# KLINIK-MAT

## El motor que mantiene vivo a KLINIK-MAT

KLINIK-MAT nace de una necesidad real: mejorar la formación clínica de futuras generaciones de matrónes y matronas.

Mi propósito es claro: que cada estudiante desarrolle un razonamiento clínico sólido, que agudice sus sentidos y pueda aplicar lo aprendido con criterio, empatía y excelencia. No se trata solo de aprobar una asignatura, sino de convertirse en un verdadero aporte a la sociedad.

El sistema que sostiene ese propósito es esta plataforma de casos clínicos: un entorno digital donde se puede entrenar el pensamiento clínico y poner a prueba los conocimientos de manera práctica.

No es un sistema perfecto —todavía—, pero está vivo, creciendo y adaptándose. Su verdadero valor está en que los estudiantes quieran formar parte de él, sientan que les pertenece y lo impulsen con su participación.

La energía humana que lo mueve son ellos mismos: las y los estudiantes de obstetricia.
Ellos son quienes mantendrán vivo este proyecto, si se les brindan las condiciones para hacerlo florecer.

Mi tarea, como creador, es construir una herramienta digna de su vocación: una web sólida, inspiradora y útil.

Porque cuando un propósito, un sistema y una comunidad vibran en la misma frecuencia… el aprendizaje deja de ser teoría, y se convierte en una forma de transformar el mundo.

---

## Getting Started

This is a [Next.js](https://nextjs.org/) project.

### 1. Environment Setup

This project requires a PostgreSQL database. Create a `.env` file in the root of the project and add the database connection string:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Desarrollo local: correo (MailHog)

Para probar el flujo de "magic link" sin enviar correos reales, usa MailHog.

1) Levanta MailHog con Docker Compose:

```bash
docker-compose up -d mailhog
```

2) Copia el ejemplo de variables y ajusta `.env.local`:

```bash
cp .env.example .env.local
# editar .env.local y poner NEXTAUTH_SECRET, DATABASE_URL, y ENABLE_NEXTAUTH_DEV=true
```

3) Inicia la app (con MailHog corriendo):

```bash
npm run dev:mail
```

4) Abre la UI de MailHog en `http://localhost:8025` para ver los correos.

Dev endpoints

Este repo incluye endpoints de depuración (`/api/debug/send-magic-link` y `/api/debug/complete-magic`).
Están protegidos y solo se activan si en tu `.env.local` pones:

```
ENABLE_NEXTAUTH_DEV=true
```

No pongas `ENABLE_NEXTAUTH_DEV=true` en entornos públicos ni en producción.


## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
