// app/login/page.tsx
import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirigir a la ruta estándar de Clerk
  redirect('/sign-in');
}
