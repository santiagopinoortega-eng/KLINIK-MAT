"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { patchJSON } from '@/lib/fetch-with-csrf';
import {
  ChartBarIcon,
  UserCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  TrophyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

type Result = {
  id: string;
  caseId: string;
  caseTitle: string;
  caseArea: string;
  score: number;
  totalPoints: number;
  mode: string;
  timeSpent: number | null;
  completedAt: string;
};

type Stats = {
  totalCompleted: number;
  averageScore: number;
  byArea: Record<string, number>;
  byMode: Record<string, number>;
};

type ProfileData = {
  name: string | null;
  email: string;
  country: string | null;
  university: string | null;
  yearOfStudy: number | null;
  specialty: string | null;
};

const UNIVERSIDADES_CHILE = [
  'Universidad de Chile',
  'Pontificia Universidad Católica de Chile',
  'Universidad de Concepción',
  'Universidad Austral de Chile',
  'Universidad de Valparaíso',
  'Universidad de Santiago de Chile (USACH)',
  'Universidad de La Frontera',
  'Universidad de Antofagasta',
  'Universidad Católica del Norte',
  'Universidad de Talca',
  'Universidad Católica del Maule',
  'Universidad Mayor',
  'Universidad San Sebastián',
  'Universidad de los Andes',
  'Universidad Finis Terrae',
  'Universidad Andrés Bello',
  'Universidad del Desarrollo',
  "Universidad Bernardo O'Higgins",
  'Universidad Católica de la Santísima Concepción',
  'Universidad Católica Silva Henríquez',
  'Otra'
];

const ESPECIALIDADES = [
  'Ginecología y Salud de la Mujer',
  'Salud Sexual y Reproductiva',
  'Obstetricia y Puerperio',
  'Neonatología',
  'Medicina Materno-Fetal',
  'Ecografía Obstétrica',
  'Perinatología',
  'Lactancia Materna',
  'Salud Familiar',
  'Docencia en Obstetricia',
  'Gestión en Salud',
  'Investigación en Obstetricia',
  'Aún no lo sé',
  'Otra'
];

export default function MiProgresoClient() {
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [editingProfile, setEditingProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'profile' | 'stats' | 'history'>('overview');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const resResults = await fetch(`/api/results?area=${selectedArea}&limit=100&t=${Date.now()}`);
        const dataResults = await resResults.json();
        
        if (dataResults.success) {
          setResults(dataResults.results);
          setStats(dataResults.stats);
        }

        const resProfile = await fetch('/api/profile');
        const dataProfile = await resProfile.json();
        
        if (dataProfile.success) {
          setProfile(dataProfile.user);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedArea]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-red-600 mx-auto"></div>
          <p className="text-gray-700 text-lg font-semibold mt-6">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  const areaColors: Record<string, string> = {
    ginecologia: 'bg-rose-100 text-rose-800 border-rose-200',
    obstetricia: 'bg-purple-100 text-purple-800 border-purple-200',
    neonatologia: 'bg-blue-100 text-blue-800 border-blue-200',
    ssr: 'bg-green-100 text-green-800 border-green-200',
    General: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: ChartBarIcon },
    { id: 'profile', label: 'Mi Perfil', icon: UserCircleIcon },
    { id: 'stats', label: 'Estadísticas', icon: TrophyIcon },
    { id: 'history', label: 'Historial', icon: ClockIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-white">
      <div className="flex h-screen overflow-hidden">
        <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r-2 border-gray-200 transition-all duration-300 flex flex-col shadow-xl`}>
          <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Mi Progreso</h2>
                  <p className="text-xs text-gray-500">Panel de Estudiante</p>
                </div>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              {sidebarOpen ? <ChevronLeftIcon className="w-5 h-5 text-gray-600" /> : <ChevronRightIcon className="w-5 h-5 text-gray-600" />}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Icon className="w-6 h-6" />
                  {sidebarOpen && <span className="font-semibold">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t-2 border-gray-100">
            <Link href="/casos" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {sidebarOpen && <span>Volver a Casos</span>}
            </Link>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {activeView === 'overview' && 'Panel de Progreso'}
                {activeView === 'profile' && 'Mi Perfil Académico'}
                {activeView === 'stats' && 'Estadísticas Detalladas'}
                {activeView === 'history' && 'Historial de Casos'}
              </h1>
            </div>

            {activeView === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Casos Completados</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalCompleted}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Promedio General</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Áreas Estudiadas</p>
                        <p className="text-3xl font-bold text-gray-900">{Object.keys(stats.byArea).length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                        <TrophyIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Mejor Resultado</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {results.length > 0 ? Math.max(...results.map(r => Math.round((r.score / r.totalPoints) * 100))) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <ChartBarIcon className="w-7 h-7 text-red-600" />
                    Progreso por Área Clínica
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(stats.byArea).map(([area, count]) => {
                      const areaNames: Record<string, string> = {
                        ginecologia: 'Ginecología y Salud de la Mujer',
                        ssr: 'Salud Sexual y Reproductiva',
                        obstetricia: 'Obstetricia y Puerperio',
                        neonatologia: 'Neonatología'
                      };
                      const percentage = stats.totalCompleted > 0 ? (count / stats.totalCompleted) * 100 : 0;
                      
                      return (
                        <div key={area} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">{areaNames[area] || area}</span>
                            <span className="text-sm font-bold text-gray-700">{count} casos ({Math.round(percentage)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-full rounded-full ${area === 'ginecologia' ? 'bg-gradient-to-r from-rose-500 to-pink-600' : area === 'ssr' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : area === 'obstetricia' ? 'bg-gradient-to-r from-purple-500 to-violet-600' : 'bg-gradient-to-r from-blue-500 to-cyan-600'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'profile' && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <UserCircleIcon className="w-8 h-8 text-red-600" />
                    Información Académica
                  </h2>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-rose-700"
                  >
                    {editingProfile ? 'Cancelar' : 'Editar Perfil'}
                  </button>
                </div>

                {!editingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium mb-1">Nombre</p>
                      <p className="font-bold text-gray-900 text-lg">{profile?.name || 'No especificado'}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium mb-1">Email</p>
                      <p className="font-bold text-gray-900">{profile?.email}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium mb-1">País</p>
                      <p className="font-bold text-gray-900 text-lg">{profile?.country || 'No especificado'}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium mb-1">Universidad</p>
                      <p className="font-bold text-gray-900 text-lg">{profile?.university || 'No especificada'}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium mb-1">Año de Estudio</p>
                      <p className="font-bold text-gray-900 text-lg">{profile?.yearOfStudy ? `${profile.yearOfStudy}° año` : 'No especificado'}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium mb-1">Especialidad de Interés</p>
                      <p className="font-bold text-gray-900 text-lg">{profile?.specialty || 'No especificada'}</p>
                    </div>
                  </div>
                ) : (
                  <ProfileEditForm
                    profile={profile}
                    onSave={(updatedProfile) => {
                      setProfile(updatedProfile);
                      setEditingProfile(false);
                    }}
                    onCancel={() => setEditingProfile(false)}
                  />
                )}
              </div>
            )}

            {activeView === 'stats' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Rendimiento por Área</h3>
                  <div className="space-y-4">
                    {Object.entries(stats.byArea).map(([area, count]) => (
                      <div key={area} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-700">{area}</span>
                        <span className="text-2xl font-bold text-red-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Casos por Modo</h3>
                  <div className="space-y-4">
                    {Object.entries(stats.byMode).map(([mode, count]) => (
                      <div key={mode} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-700">{mode === 'study' ? '📖 Modo Estudio' : '⏱️ Modo OSCE'}</span>
                        <span className="text-2xl font-bold text-red-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'history' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-gray-700">Filtrar por área:</span>
                    {['all', 'ginecologia', 'ssr', 'obstetricia', 'neonatologia'].map((area) => (
                      <button
                        key={area}
                        onClick={() => setSelectedArea(area)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold ${selectedArea === area ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {area === 'all' ? '📊 Todas' : area === 'ginecologia' ? '🌸 Ginecología' : area === 'ssr' ? '💚 SSR' : area === 'obstetricia' ? '🤰 Obstetricia' : '👶 Neonatología'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial Completo ({results.length} casos)</h2>
                  {results.length === 0 ? (
                    <div className="text-center py-16">
                      <h3 className="text-2xl font-bold text-gray-700 mb-2">Aún no has completado casos</h3>
                      <p className="text-gray-600 mb-6">Comienza a practicar para ver tu progreso aquí</p>
                      <Link href="/casos" className="inline-flex px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl">
                        Explorar Casos Clínicos
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {results.map((result) => {
                        const percentage = Math.round((result.score / result.totalPoints) * 100);
                        const date = new Date(result.completedAt);
                        
                        return (
                          <div key={result.id} className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${areaColors[result.caseArea] || areaColors.General}`}>
                                  {result.caseArea}
                                </span>
                                <h3 className="font-bold text-gray-900 text-lg mt-2">{result.caseTitle}</h3>
                                <p className="text-sm text-gray-600 mt-1">{date.toLocaleDateString('es-CL')}</p>
                              </div>
                              <div className="text-right">
                                <div className={`text-3xl font-bold ${percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {percentage}%
                                </div>
                                <p className="text-sm text-gray-600">{result.score}/{result.totalPoints} pts</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function ProfileEditForm({ profile, onSave, onCancel }: { profile: ProfileData | null; onSave: (profile: ProfileData) => void; onCancel: () => void; }) {
  const [formData, setFormData] = useState({
    country: profile?.country || 'Chile',
    university: profile?.university || '',
    yearOfStudy: profile?.yearOfStudy || '',
    specialty: profile?.specialty || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await patchJSON('/api/profile', {
        country: formData.country || null,
        university: formData.university || null,
        yearOfStudy: formData.yearOfStudy ? parseInt(formData.yearOfStudy.toString()) : null,
        specialty: formData.specialty || null,
      });

      if (result.ok && result.data?.success) {
        onSave(result.data.user);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">País</label>
          <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500">
            <option value="Chile">Chile</option>
            <option value="Argentina">Argentina</option>
            <option value="Perú">Perú</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Universidad</label>
          <select value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500">
            <option value="">Selecciona tu universidad</option>
            {UNIVERSIDADES_CHILE.map((uni) => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Año de Estudio</label>
          <select value={formData.yearOfStudy} onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500">
            <option value="">Selecciona tu año</option>
            {[1, 2, 3, 4, 5, 6, 7].map((year) => (
              <option key={year} value={year}>{year}° año</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Especialidad de Interés</label>
          <select value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500">
            <option value="">Selecciona una especialidad</option>
            {ESPECIALIDADES.map((esp) => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <button type="button" onClick={onCancel} className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl" disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl" disabled={saving}>
          {saving ? 'Guardando...' : '✓ Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
