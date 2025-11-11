// app/casos/[id]/not-found.tsx
export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold">Caso no encontrado</h1>
      <p className="text-sm text-gray-500 mt-2">
        Revisa el enlace o vuelve al listado de casos.
      </p>
    </main>
  );
}