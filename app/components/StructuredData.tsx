// app/components/StructuredData.tsx
// JSON-LD Structured Data para SEO

export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KLINIK-MAT',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://klinik-mat.vercel.app',
    description: 'Plataforma educativa con casos clínicos interactivos para estudiantes de Obstetricia',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://klinik-mat.vercel.app'}/casos?area={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KLINIK-MAT',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://klinik-mat.vercel.app',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://klinik-mat.vercel.app'}/logo.png`,
    description: 'Plataforma educativa de casos clínicos para estudiantes de Obstetricia',
    sameAs: [
      // Agregar redes sociales cuando existan
      // 'https://www.facebook.com/klinikmat',
      // 'https://www.instagram.com/klinikmat',
      // 'https://twitter.com/klinikmat',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function EducationalOrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'KLINIK-MAT',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://klinik-mat.vercel.app',
    description: 'Plataforma de aprendizaje clínico para estudiantes de Obstetricia y Neonatología',
    areaServed: {
      '@type': 'Country',
      name: 'Chile',
    },
    offers: {
      '@type': 'Offer',
      category: 'Educational',
      name: 'Casos Clínicos Interactivos',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface CaseStructuredDataProps {
  title: string;
  area: string;
  difficulty: string;
  stepCount: number;
  caseId: string;
}

export function CaseStructuredData({ 
  title, 
  area, 
  difficulty, 
  stepCount,
  caseId,
}: CaseStructuredDataProps) {
  const areaMap: Record<string, string> = {
    'ginecologia': 'Ginecología',
    'obstetricia': 'Obstetricia',
    'neonatologia': 'Neonatología',
    'ssr': 'Salud Sexual y Reproductiva',
  };

  const difficultyMap: Record<string, string> = {
    'facil': 'Principiante',
    'medio': 'Intermedio',
    'dificil': 'Avanzado',
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: title,
    description: `Caso clínico interactivo de ${areaMap[area] || area} nivel ${difficultyMap[difficulty] || difficulty}`,
    educationalLevel: difficultyMap[difficulty] || difficulty,
    about: {
      '@type': 'MedicalEntity',
      name: areaMap[area] || area,
    },
    learningResourceType: 'Caso Clínico',
    interactivityType: 'active',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://klinik-mat.vercel.app'}/casos/${caseId}`,
    inLanguage: 'es-CL',
    educationalUse: 'Práctica Clínica',
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
    },
    provider: {
      '@type': 'Organization',
      name: 'KLINIK-MAT',
    },
    hasPart: Array.from({ length: stepCount }, (_, i) => ({
      '@type': 'Question',
      position: i + 1,
      eduQuestionType: 'Multiple choice',
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ 
  items 
}: { 
  items: { name: string; url: string }[] 
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://klinik-mat.vercel.app'}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
