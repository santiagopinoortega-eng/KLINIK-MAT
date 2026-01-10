/**
 * Tipos y definiciones para el sistema de recursos MINSAL
 * @module lib/types/resources
 */

export type ResourceCategory = 
  | 'Anticoncepción'
  | 'ITS/VIH'
  | 'Embarazo y Parto'
  | 'Puerperio'
  | 'Adolescencia'
  | 'Climaterio'
  | 'Cáncer Ginecológico'
  | 'Salud Reproductiva'
  | 'General';

export type ResourceSource = 'MINSAL' | 'OMS' | 'SOCHOG' | 'SOCHOG/MINSAL' | 'Otros';

export interface Resource {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  category: ResourceCategory;
  source: ResourceSource;
  year: number;
  tags: string[];
  fileSize?: string;
  pages?: number;
  isPremium?: boolean;
}

export interface ResourceFilters {
  search: string;
  category: ResourceCategory | 'Todos';
  source: ResourceSource | 'Todos';
}

export interface ResourceStats {
  totalResources: number;
  byCategory: Record<ResourceCategory, number>;
  bySource: Record<ResourceSource, number>;
}
