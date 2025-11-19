// app/login/verificar/page.tsx
// Esta página ya no es necesaria con Clerk (Clerk maneja la verificación automáticamente)
// Redirigimos a la página de casos
import { redirect } from 'next/navigation';

export default function VerifyRequestPage() {
  redirect('/casos');
}