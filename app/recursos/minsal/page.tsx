'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

type Recurso = {
  title: string;
  description?: string;
  href: string; // ruta directa a /public/resources/...
  modulo: 'Anticoncepción' | 'ITS' | 'Consejería' | 'General';
  fuente?: string;
};

const recursos: Recurso[] = [
  // === Orden y nombres EXACTOS según tu carpeta ===
  {
    title: 'Consejería SSR Adolescentes (2016)',
    href: '/resources/consejeria-adolescente.pdf',
    description: 'Guía práctica con enfoque de derechos y confidencialidad.',
    modulo: 'Consejería',
    fuente: 'MINSAL, 2016',
  },
  {
    title: 'OT Control Adolescente (2021)',
    href: '/resources/control-adolescente.pdf',
    description: 'Atención integral y consejería en salud adolescente.',
    modulo: 'Consejería',
    fuente: 'MINSAL, 2021',
  },
  {
    title: 'Criterios de Elegibilidad OMS 2021',
    href: '/resources/criterios-elegibilidad.pdf',
    description: 'Actualización de criterios MEC para uso seguro de MAC.',
    modulo: 'Anticoncepción',
    fuente: 'OMS / MINSAL, 2021',
  },
  {
    title: 'Libro de Anticoncepción (SOCHEG 2023)',
    href: '/resources/libro-anticoncepcion.pdf',
    description: 'Texto actualizado con fundamentos clínicos y criterios basados en evidencia.',
    modulo: 'Anticoncepción',
    fuente: 'SOCHEG, 2023',
  },
  {
    title: 'Manual de Obstetricia y Ginecología (2024)',
    href: '/resources/Manual-obstetricia.ginecologia.pdf',
    description: 'Manual clínico con contenidos de obstetricia y ginecología.',
    modulo: 'General',
    fuente: '2024',
  },
  {
    title: 'Norma Regulación de la Fertilidad (2018)',
    href: '/resources/norma-fertilidad.pdf',
    description: 'Norma oficial chilena para la regulación de la fertilidad.',
    modulo: 'Anticoncepción',
    fuente: 'MINSAL, 2018',
  },
  {
    title: 'Norma Técnica N°187: ITS',
    href: '/resources/norma-its.pdf',
    description: 'Prevención, diagnóstico y tratamiento integral de las ITS.',
    modulo: 'ITS',
    fuente: 'MINSAL, 2018',
  },
];

export default function Page() {
  const [busqueda, setBusqueda] = useState('');
  const [modulo, setModulo] = useState<'Todos' | 'Anticoncepción' | 'ITS' | 'Consejería' | 'General'>('Todos');
  const modulos = ['Todos', 'Anticoncepción', 'ITS', 'Consejería', 'General'] as const;

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return recursos.filter(
      (r) =>
        (modulo === 'Todos' || r.modulo === modulo) &&
        (r.title.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q))
    );
  }, [busqueda, modulo]);

  return (
    <div className="bg-[var(--km-surface-2)] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-blue-700">Centro de Recursos Clínicos</h1>
          <p className="mt-3 text-lg text-gray-600">Descarga las normativas, guías y documentos técnicos.</p>
        </div>

        {/* Búsqueda / filtro */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <input
            type="text"
            placeholder="Buscar documento o palabra clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 rounded-lg px-4 py-2 shadow-sm"
            style={{ background: 'var(--km-surface-1)', border: '1px solid rgba(183,43,43,0.08)' }}
          />
          <select
            value={modulo}
            onChange={(e) => setModulo(e.target.value as any)}
            className="rounded-lg px-4 py-2 shadow-sm"
            style={{ background: 'var(--km-surface-1)', border: '1px solid rgba(183,43,43,0.08)' }}
          >
            {modulos.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Lista */}
        <div className="grid gap-6 sm:grid-cols-2">
          {filtrados.map((doc) => (
            <a key={doc.title} href={doc.href} download className="block group">
              <div className="card rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-blue-700 group-hover:text-blue-800 transition-colors">
                    {doc.title}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">{doc.modulo}</span>
                </div>

                {doc.description && <p className="mt-2 text-base text-gray-700">{doc.description}</p>}
                {doc.fuente && <p className="mt-4 text-sm text-gray-500 italic">{doc.fuente}</p>}

                <div className="mt-6">
                  <span className="inline-block bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                    Descargar PDF
                  </span>
                </div>
              </div>
            </a>
          ))}

          {filtrados.length === 0 && (
            <p className="col-span-full text-center text-gray-500">No se encontraron documentos con esos filtros.</p>
          )}
        </div>

        {/* Volver */}
        <div className="mt-12 text-center">
          <Link
            href="/casos"
            className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            Volver a Casos Clínicos
          </Link>
        </div>
      </div>
    </div>
  );
}