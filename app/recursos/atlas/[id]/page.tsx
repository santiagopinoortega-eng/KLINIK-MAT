import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  BookOpenIcon,
  BeakerIcon,
  ChartBarIcon,
  LightBulbIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { getItemById, ATLAS_CATEGORIES } from '../data';
import { notFound } from 'next/navigation';

export default async function AtlasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = getItemById(resolvedParams.id);
  
  if (!item) {
    notFound();
  }

  const category = ATLAS_CATEGORIES.find(c => c.id === item.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <Link 
          href="/recursos/atlas"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al Atlas
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${category?.color} shadow-lg mb-4`}>
            <span>{category?.icon}</span>
            {category?.name}
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {item.title}
          </h1>
        </div>

        {/* Main Image */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="relative h-96 bg-gray-50 flex items-center justify-center">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="max-h-full max-w-full object-contain p-8"
            />
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" />
              Fuente: {item.imageSource}
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpenIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Descripción Anatómica</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Clinical Relevance */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm p-6 border border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <BeakerIcon className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Relevancia Clínica</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {item.clinicalRelevance}
            </p>
          </div>
        </div>

        {/* Measurements */}
        {item.measurements && item.measurements.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Medidas de Referencia</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {item.measurements.map((measurement, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100"
                >
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {measurement.label}
                  </div>
                  <div className="text-3xl font-bold text-purple-600">
                    {measurement.value}
                    <span className="text-lg ml-1 text-purple-500">{measurement.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Points */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <LightBulbIcon className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Puntos Clave</h2>
          </div>
          
          <div className="space-y-3">
            {item.keyPoints.map((point, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* References */}
        {item.references && item.references.length > 0 && (
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-200 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Referencias</h2>
            </div>
            
            <ul className="space-y-2">
              {item.references.map((reference, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400 font-mono">[{index + 1}]</span>
                  <span>{reference}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/recursos/atlas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <BookOpenIcon className="w-5 h-5" />
            Ver más contenido del Atlas
          </Link>
        </div>
      </div>
    </div>
  );
}
