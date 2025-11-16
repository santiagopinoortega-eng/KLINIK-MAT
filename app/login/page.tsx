// app/login/page.tsx
// Redirect to home — login UI not used in this deployment
import { redirect } from 'next/navigation';

export default function LoginPage() {
  redirect('/');
}
