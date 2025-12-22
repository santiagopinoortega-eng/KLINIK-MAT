'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { patchJSON } from '@/lib/fetch-with-csrf';
import {
  UserCircleIcon,
  AcademicCapIcon,
  MapPinIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

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

export default function MiPerfilPage() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    university: '',
    yearOfStudy: '' as string | number,
    specialty: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push('/login');
      return;
    }

    fetchProfile();
  }, [isLoaded, userId, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
        setFormData({
          country: data.user.country || 'Chile',
          university: data.user.university || '',
          yearOfStudy: data.user.yearOfStudy || '',
          specialty: data.user.specialty || '',
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setLoading(false);
    }
  };

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
        setProfile(result.data.user);
        setEditingProfile(false);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-red-600 mx-auto"></div>
          <p className="text-gray-700 text-lg font-semibold mt-6">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/casos" className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors mb-4">
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-semibold">Volver a Casos</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCircleIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Mi Perfil Académico</h1>
                <p className="text-gray-600 mt-1">Información personal y académica</p>
              </div>
            </div>

            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <PencilIcon className="w-5 h-5" />
                Editar Perfil
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          {!editingProfile ? (
            <div className="p-8">
              {/* Información Personal */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b-2 border-gray-100">
                  <UserCircleIcon className="w-7 h-7 text-red-600" />
                  Información Personal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <UserCircleIcon className="w-5 h-5 text-gray-600" />
                      <p className="text-sm text-gray-600 font-medium">Nombre Completo</p>
                    </div>
                    <p className="font-bold text-gray-900 text-lg ml-8">{profile?.name || user?.fullName || 'No especificado'}</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">Correo Electrónico</p>
                    </div>
                    <p className="font-bold text-gray-900 ml-8 break-all">{profile?.email || user?.primaryEmailAddress?.emailAddress}</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPinIcon className="w-5 h-5 text-gray-600" />
                      <p className="text-sm text-gray-600 font-medium">País</p>
                    </div>
                    <p className="font-bold text-gray-900 text-lg ml-8">{profile?.country || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              {/* Información Académica */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b-2 border-gray-100">
                  <AcademicCapIcon className="w-7 h-7 text-red-600" />
                  Información Académica
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border-2 border-red-200">
                    <div className="flex items-center gap-3 mb-2">
                      <BuildingLibraryIcon className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-700 font-medium">Universidad</p>
                    </div>
                    <p className="font-bold text-gray-900 text-lg ml-8">{profile?.university || 'No especificada'}</p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border-2 border-red-200">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarIcon className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-700 font-medium">Año de Estudio</p>
                    </div>
                    <p className="font-bold text-gray-900 text-lg ml-8">
                      {profile?.yearOfStudy ? `${profile.yearOfStudy}° año` : 'No especificado'}
                    </p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border-2 border-red-200 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <BriefcaseIcon className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-700 font-medium">Especialidad de Interés</p>
                    </div>
                    <p className="font-bold text-gray-900 text-lg ml-8">{profile?.specialty || 'No especificada'}</p>
                  </div>
                </div>
              </div>

              {/* Nota informativa */}
              <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Información importante</p>
                    <p className="text-sm text-blue-800">
                      Estos datos nos ayudan a personalizar tu experiencia de aprendizaje y generar estadísticas relevantes para tu formación académica en Obstetricia.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <PencilIcon className="w-7 h-7 text-red-600" />
                Editar Información
              </h2>

              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5 text-red-600" />
                      País
                    </label>
                    <select 
                      value={formData.country} 
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })} 
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    >
                      <option value="Chile">Chile</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Perú">Perú</option>
                      <option value="Colombia">Colombia</option>
                      <option value="México">México</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <BuildingLibraryIcon className="w-5 h-5 text-red-600" />
                      Universidad
                    </label>
                    <select 
                      value={formData.university} 
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })} 
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    >
                      <option value="">Selecciona tu universidad</option>
                      {UNIVERSIDADES_CHILE.map((uni) => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-red-600" />
                      Año de Estudio
                    </label>
                    <select 
                      value={formData.yearOfStudy} 
                      onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })} 
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    >
                      <option value="">Selecciona tu año</option>
                      {[1, 2, 3, 4, 5, 6, 7].map((year) => (
                        <option key={year} value={year}>{year}° año</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <BriefcaseIcon className="w-5 h-5 text-red-600" />
                      Especialidad de Interés
                    </label>
                    <select 
                      value={formData.specialty} 
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} 
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    >
                      <option value="">Selecciona una especialidad</option>
                      {ESPECIALIDADES.map((esp) => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-100">
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingProfile(false);
                    setFormData({
                      country: profile?.country || 'Chile',
                      university: profile?.university || '',
                      yearOfStudy: profile?.yearOfStudy || '',
                      specialty: profile?.specialty || '',
                    });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all" 
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2" 
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Enlaces rápidos */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/mi-progreso" className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <AcademicCapIcon className="w-6 h-6 text-red-600" />
              <h3 className="font-bold text-gray-900">Mi Progreso</h3>
            </div>
            <p className="text-sm text-gray-600">Ver estadísticas y resultados</p>
          </Link>

          <Link href="/casos" className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-bold text-gray-900">Casos Clínicos</h3>
            </div>
            <p className="text-sm text-gray-600">Explorar casos de estudio</p>
          </Link>

          <Link href="/profile" className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="font-bold text-gray-900">Suscripción</h3>
            </div>
            <p className="text-sm text-gray-600">Gestionar plan y pagos</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
