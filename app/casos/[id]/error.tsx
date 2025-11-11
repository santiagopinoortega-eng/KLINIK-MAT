// app/casos/[id]/error.tsx
'use client';
export default function Error({ error }: { error: Error }) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h2 className="text-xl font-semibold mb-2">No pudimos cargar el caso</h2>
      <p className="mb-4 text-sm text-red-700">{error.message}</p>
      <p className="text-sm">Prueba recargar. Si persiste, vuelve a la lista y reintenta.</p>
    </main>
  );
}