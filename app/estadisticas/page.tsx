// app/estadisticas/page.tsx
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Estadísticas | KLINIK-MAT',
  description: 'Métricas de uso de la plataforma',
};

export default async function EstadisticasPage() {
  const { userId } = await auth();

  // Solo permitir a admins (puedes ajustar esta lógica)
  if (!userId) {
    redirect('/login');
  }

  // Obtener estadísticas de la base de datos
  const [
    totalCasosCompletados,
    totalUsuarios,
    casosPorArea,
    promedioPorArea,
    casosRecientes,
  ] = await Promise.all([
    // Total de casos completados
    prisma.studentResult.count(),

    // Total de usuarios únicos
    prisma.studentResult.groupBy({
      by: ['userId'],
      _count: { userId: true },
    }).then(results => results.length),

    // Casos por área
    prisma.studentResult.groupBy({
      by: ['caseArea'],
      _count: { caseArea: true },
      orderBy: { _count: { caseArea: 'desc' } },
    }),

    // Promedio de score por área
    prisma.studentResult.groupBy({
      by: ['caseArea'],
      _avg: {
        score: true,
        totalPoints: true,
        timeSpent: true,
      },
      _count: { caseArea: true },
    }),

    // Últimos 10 casos completados
    prisma.studentResult.findMany({
      take: 10,
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        caseTitle: true,
        caseArea: true,
        score: true,
        totalPoints: true,
        mode: true,
        timeSpent: true,
        completedAt: true,
      },
    }),
  ]);

  return (
    <div className="container-app py-8">
      <div className="max-w-7xl mx-auto">
        <h1 
          className="text-4xl font-bold mb-8"
          style={{ color: 'var(--km-cardinal)' }}
        >
          Estadísticas de la Plataforma
        </h1>

        {/* Métricas principales */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Casos Completados"
            value={totalCasosCompletados}
            icon="📚"
          />
          <MetricCard
            title="Usuarios Activos"
            value={totalUsuarios}
            icon="👥"
          />
          <MetricCard
            title="Áreas Cubiertas"
            value={casosPorArea.length}
            icon="🏥"
          />
        </div>

        {/* Casos por área */}
        <div className="card p-6 mb-8">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--km-cardinal)' }}
          >
            Casos Completados por Área
          </h2>
          <div className="space-y-3">
            {casosPorArea.map((area) => (
              <div key={area.caseArea} className="flex items-center justify-between">
                <span className="font-medium" style={{ color: 'var(--km-text-900)' }}>
                  {area.caseArea}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-64 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(area._count.caseArea / totalCasosCompletados) * 100}%`,
                        background: 'var(--km-cardinal)',
                      }}
                    />
                  </div>
                  <span 
                    className="text-sm font-semibold min-w-[60px] text-right"
                    style={{ color: 'var(--km-text-700)' }}
                  >
                    {area._count.caseArea} casos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rendimiento por área */}
        <div className="card p-6 mb-8">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--km-cardinal)' }}
          >
            Rendimiento Promedio por Área
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2" style={{ borderColor: 'var(--km-cardinal)' }}>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--km-text-900)' }}>
                    Área
                  </th>
                  <th className="text-right py-3 px-4" style={{ color: 'var(--km-text-900)' }}>
                    Score Promedio
                  </th>
                  <th className="text-right py-3 px-4" style={{ color: 'var(--km-text-900)' }}>
                    Tiempo Promedio
                  </th>
                  <th className="text-right py-3 px-4" style={{ color: 'var(--km-text-900)' }}>
                    Casos
                  </th>
                </tr>
              </thead>
              <tbody>
                {promedioPorArea.map((area) => {
                  const percentage = area._avg.score && area._avg.totalPoints
                    ? Math.round((area._avg.score / area._avg.totalPoints) * 100)
                    : 0;
                  const timeMinutes = area._avg.timeSpent
                    ? Math.round(area._avg.timeSpent / 60)
                    : 0;

                  return (
                    <tr 
                      key={area.caseArea}
                      className="border-b hover:bg-neutral-50"
                      style={{ borderColor: 'var(--km-beige)' }}
                    >
                      <td className="py-3 px-4 font-medium" style={{ color: 'var(--km-text-900)' }}>
                        {area.caseArea}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className="font-semibold"
                          style={{
                            color: percentage >= 70 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444',
                          }}
                        >
                          {percentage}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4" style={{ color: 'var(--km-text-700)' }}>
                        {timeMinutes} min
                      </td>
                      <td className="text-right py-3 px-4" style={{ color: 'var(--km-text-700)' }}>
                        {area._count.caseArea}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Casos recientes */}
        <div className="card p-6">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--km-cardinal)' }}
          >
            Últimos Casos Completados
          </h2>
          <div className="space-y-2">
            {casosRecientes.map((caso) => {
              const percentage = Math.round((caso.score / caso.totalPoints) * 100);
              const timeMinutes = caso.timeSpent ? Math.round(caso.timeSpent / 60) : 0;

              return (
                <div
                  key={caso.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50"
                >
                  <div>
                    <div className="font-medium" style={{ color: 'var(--km-text-900)' }}>
                      {caso.caseTitle}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--km-text-600)' }}>
                      {caso.caseArea} • {caso.mode === 'osce' ? 'Modo OSCE' : 'Modo Estudio'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="font-semibold"
                      style={{
                        color: percentage >= 70 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444',
                      }}
                    >
                      {percentage}%
                    </span>
                    <span className="text-sm" style={{ color: 'var(--km-text-600)' }}>
                      {timeMinutes} min
                    </span>
                    <span className="text-xs" style={{ color: 'var(--km-text-500)' }}>
                      {new Date(caso.completedAt).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium" style={{ color: 'var(--km-text-600)' }}>
          {title}
        </h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold" style={{ color: 'var(--km-cardinal)' }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
