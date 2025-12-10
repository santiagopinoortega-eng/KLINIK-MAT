"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { patchJSON } from '@/lib/fetch-with-csrf';

// Tipos
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

export default function MiProgresoClient() {
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [editingProfile, setEditingProfile] = useState(false);
  const router = useRouter();

  // Cargar resultados
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Cargar resultados - añadimos timestamp para evitar cache
        const resResults = await fetch(`/api/results?area=${selectedArea}&limit=100&t=${Date.now()}`);
        const dataResults = await resResults.json();
        
        console.log('📊 Resultados cargados:', {
          success: dataResults.success,
          totalResults: dataResults.results?.length || 0,
          results: dataResults.results,
          stats: dataResults.stats
        });
        
        if (dataResults.success) {
          setResults(dataResults.results);
          setStats(dataResults.stats);
        }

        // Cargar perfil
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

  // Refrescar cuando la página vuelve a ser visible (usuario vuelve de otro tab/caso)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refrescar datos cuando vuelve a la pestaña
        const fetchData = async () => {
          try {
            const resResults = await fetch(`/api/results?area=${selectedArea}&limit=100&t=${Date.now()}`);
            const dataResults = await resResults.json();
            
            if (dataResults.success) {
              setResults(dataResults.results);
              setStats(dataResults.stats);
            }
          } catch (error) {
            console.error('Error al refrescar datos:', error);
          }
        };
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedArea]);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="card h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--km-crimson)] mx-auto mb-4"></div>
            <p className="text-neutral-600">Cargando tu progreso...</p>
          </div>
        </div>
      </div>
    );
  }

  const areaColors: Record<string, string> = {
    ginecologia: 'bg-pink-100 text-pink-800',
    obstetricia: 'bg-purple-100 text-purple-800',
    neonatologia: 'bg-blue-100 text-blue-800',
    ssr: 'bg-green-100 text-green-800',
    General: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E3A5F] mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Mi Progreso
          </h1>
          <p className="text-neutral-600">
            Visualiza tu rendimiento y estadísticas de estudio
          </p>
        </div>
        <Link 
          href="/casos" 
          className="btn btn-primary w-full md:w-auto"
        >
          ← Volver a Casos
        </Link>
      </div>

      {/* Perfil del Estudiante */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            👤 Mi Perfil
          </h2>
          <button 
            onClick={() => setEditingProfile(!editingProfile)}
            className="text-sm text-[var(--km-crimson)] hover:underline font-medium"
          >
            {editingProfile ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>

        {!editingProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600 mb-1">Nombre</div>
              <div className="font-semibold text-neutral-900">{profile?.name || 'No especificado'}</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600 mb-1">Email</div>
              <div className="font-semibold text-neutral-900 text-sm truncate">{profile?.email}</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600 mb-1">País</div>
              <div className="font-semibold text-neutral-900">{profile?.country || 'No especificado'}</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600 mb-1">Universidad</div>
              <div className="font-semibold text-neutral-900">{profile?.university || 'No especificada'}</div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600 mb-1">Año de Estudio</div>
              <div className="font-semibold text-neutral-900">
                {profile?.yearOfStudy ? `${profile.yearOfStudy}° año` : 'No especificado'}
              </div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600 mb-1">Especialidad de Interés</div>
              <div className="font-semibold text-neutral-900">{profile?.specialty || 'No especificada'}</div>
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

      {/* Estadísticas Generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-blue-700 font-medium">Casos Completados</div>
                <div className="text-3xl font-bold text-blue-900">{stats.totalCompleted}</div>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-500 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-green-700 font-medium">Promedio General</div>
                <div className="text-3xl font-bold text-green-900">{stats.averageScore}%</div>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-500 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-purple-700 font-medium">Áreas Estudiadas</div>
                <div className="text-3xl font-bold text-purple-900">{Object.keys(stats.byArea).length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-neutral-700">Filtrar por área:</span>
          {['all', 'ginecologia', 'obstetricia', 'neonatologia', 'ssr'].map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedArea === area
                  ? 'bg-[var(--km-crimson)] text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {area === 'all' ? '📊 Todas' : area === 'ginecologia' ? '🌸 Ginecología' : area === 'obstetricia' ? '🤰 Obstetricia' : area === 'neonatologia' ? '👶 Neonatología' : '❤️ SSR'}
            </button>
          ))}
        </div>
      </div>

      {/* Historial de Resultados */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          📊 Historial de Casos ({results.length})
        </h2>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-neutral-700 mb-2">Aún no has completado casos</h3>
            <p className="text-neutral-600 mb-6">Comienza a practicar para ver tu progreso aquí</p>
            <Link href="/casos" className="btn btn-primary">
              Explorar Casos Clínicos
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => {
              const percentage = Math.round((result.score / result.totalPoints) * 100);
              const date = new Date(result.completedAt);
              
              return (
                <div key={result.id} className="p-4 bg-neutral-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${areaColors[result.caseArea] || areaColors.General}`}>
                          {result.caseArea}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-neutral-200 text-neutral-700">
                          {result.mode === 'study' ? '📖 Estudio' : result.mode === 'osce' ? '⏱️ OSCE' : result.mode}
                        </span>
                      </div>
                      <h3 className="font-semibold text-neutral-900">{result.caseTitle}</h3>
                      <div className="text-sm text-neutral-600 mt-1">
                        {date.toLocaleDateString('es-CL', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {result.timeSpent && (
                          <span className="ml-3">
                            ⏱️ {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-neutral-600">Puntuación</div>
                        <div className="text-lg font-bold" style={{ 
                          color: percentage >= 70 ? 'var(--km-success)' : percentage >= 50 ? 'var(--km-warning)' : 'var(--km-error)' 
                        }}>
                          {percentage}%
                        </div>
                        <div className="text-xs text-neutral-500">{result.score}/{result.totalPoints} pts</div>
                      </div>
                      
                      <Link 
                        href={`/casos/${result.caseId}`}
                        className="btn btn-secondary text-sm px-4 py-2"
                      >
                        Ver Caso →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de edición de perfil
function ProfileEditForm({ 
  profile, 
  onSave, 
  onCancel 
}: { 
  profile: ProfileData | null; 
  onSave: (profile: ProfileData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    country: profile?.country || '',
    university: profile?.university || '',
    yearOfStudy: profile?.yearOfStudy || '',
    specialty: profile?.specialty || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('🔧 Guardando perfil...');
      const result = await patchJSON('/api/profile', {
        country: formData.country || null,
        university: formData.university || null,
        yearOfStudy: formData.yearOfStudy ? parseInt(formData.yearOfStudy.toString()) : null,
        specialty: formData.specialty || null,
      });

      if (result.ok && result.data?.success) {
        console.log('✅ Perfil guardado exitosamente');
        onSave(result.data.user);
      } else {
        console.error('❌ Error al guardar perfil:', result.error);
        alert('Error al guardar perfil: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ Excepción al guardar perfil:', error);
      alert('Error al guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            País
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--km-crimson)] focus:border-transparent"
            placeholder="Ej: Chile"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Universidad
          </label>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--km-crimson)] focus:border-transparent"
            placeholder="Ej: Universidad de Chile"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Año de Estudio (1-7)
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={formData.yearOfStudy}
            onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--km-crimson)] focus:border-transparent"
            placeholder="Ej: 4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Especialidad de Interés
          </label>
          <input
            type="text"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--km-crimson)] focus:border-transparent"
            placeholder="Ej: Ginecología"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
