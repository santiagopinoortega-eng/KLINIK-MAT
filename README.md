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

This is a [Next.js](https://nextjs.org/) project with [Clerk](https://clerk.com) authentication.

### 1. Environment Setup

This project requires:
- PostgreSQL database
- Clerk account (for authentication)

Create a `.env.local` file in the root of the project:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Clerk Authentication (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_SECRET_KEY="sk_test_xxxxx"
CLERK_WEBHOOK_SECRET="whsec_xxxxx"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npm run db:seed
```

### 4. Setup Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Webhooks
3. Add endpoint: `http://localhost:3000/api/webhooks/clerk` (for local dev, use ngrok or similar)
4. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
5. Copy the webhook secret to `CLERK_WEBHOOK_SECRET` in `.env.local`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 14 (App Router)
- **Authentication:** [Clerk](https://clerk.com)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
