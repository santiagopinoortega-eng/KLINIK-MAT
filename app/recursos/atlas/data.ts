/**
 * Atlas de Anatomía Obstétrica
 * Contenido educativo con imágenes de dominio público
 */

export interface AtlasItem {
  id: string;
  title: string;
  category: 'pelvis' | 'fetal' | 'placenta' | 'parto' | 'utero';
  description: string;
  clinicalRelevance: string;
  imageUrl: string;
  imageSource: string;
  measurements?: {
    label: string;
    value: string;
    unit: string;
  }[];
  keyPoints: string[];
  references?: string[];
}

export const ATLAS_CATEGORIES = [
  {
    id: 'pelvis',
    name: 'Pelvis Obstétrica',
    description: 'Anatomía ósea y diámetros pelvianos',
    icon: '🦴',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'fetal',
    name: 'Anatomía Fetal',
    description: 'Cráneo fetal, fontanelas y diámetros',
    icon: '👶',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'placenta',
    name: 'Placenta y Anexos',
    description: 'Placenta, cordón umbilical y membranas',
    icon: '🫁',
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 'parto',
    name: 'Canal del Parto',
    description: 'Mecanismo del parto y planos',
    icon: '🚼',
    color: 'from-green-500 to-teal-500',
  },
  {
    id: 'utero',
    name: 'Útero Grávido',
    description: 'Cambios anatómicos del embarazo',
    icon: '🤰',
    color: 'from-indigo-500 to-purple-500',
  },
];

export const ATLAS_ITEMS: AtlasItem[] = [
  // PELVIS OBSTÉTRICA
  {
    id: 'pelvis-diametros',
    title: 'Diámetros de la Pelvis Ósea',
    category: 'pelvis',
    description: 'La pelvis obstétrica se divide en pelvis mayor (falsa) y pelvis menor (verdadera). Los diámetros del estrecho superior son cruciales para determinar la vía del parto.',
    clinicalRelevance: 'La evaluación de los diámetros pelvianos es fundamental en la pelvimetría clínica para predecir desproporción cefalopélvica. El diámetro conjugado verdadero (≥11 cm) es el más importante.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    imageSource: 'Ilustración médica educativa',
    measurements: [
      { label: 'Conjugado Verdadero', value: '11', unit: 'cm' },
      { label: 'Conjugado Diagonal', value: '12.5', unit: 'cm' },
      { label: 'Diámetro Transverso', value: '13.5', unit: 'cm' },
      { label: 'Diámetro Oblicuo', value: '12.5', unit: 'cm' },
    ],
    keyPoints: [
      'Estrecho superior: límite entre pelvis mayor y menor',
      'Conjugado verdadero: desde promontorio sacro a borde superior del pubis',
      'Diámetro transverso: mayor diámetro del estrecho superior',
      'Pelvis ginecoide: la más favorable para el parto (50% mujeres)',
    ],
    references: [
      'Williams Obstetrics, 26th Edition',
      'Cunningham FG, et al. Maternal Anatomy',
    ],
  },
  {
    id: 'pelvis-planos',
    title: 'Planos de Hodge',
    category: 'pelvis',
    description: 'Los cuatro planos de Hodge dividen la pelvis menor en segmentos para evaluar el descenso fetal durante el trabajo de parto.',
    clinicalRelevance: 'Estos planos permiten determinar la altura de la presentación y progreso del trabajo de parto. El uso de estaciones (espinas ciáticas como referencia) es más preciso.',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80',
    imageSource: 'Ilustración médica educativa',
    keyPoints: [
      'Plano I: paralelo al estrecho superior, pasa por borde superior del pubis',
      'Plano II: paralelo al I, pasa por borde inferior del pubis',
      'Plano III: paralelo, pasa por espinas ciáticas (estación 0)',
      'Plano IV: paralelo, pasa por punta del cóccix',
      'Estaciones: +3 a -3, siendo 0 las espinas ciáticas',
    ],
  },
  
  // ANATOMÍA FETAL
  {
    id: 'craneo-fetal-fontanelas',
    title: 'Fontanelas y Suturas del Cráneo Fetal',
    category: 'fetal',
    description: 'El cráneo fetal presenta fontanelas (espacios membranosos) y suturas que permiten el moldeamiento durante el parto.',
    clinicalRelevance: 'La palpación de fontanelas durante el tacto vaginal permite identificar la variedad de posición fetal. La fontanela anterior cierra a los 18 meses, la posterior a los 2-3 meses.',
    imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80',
    imageSource: 'Ilustración médica educativa',
    keyPoints: [
      'Fontanela anterior (bregmática): romboidal, 2.5x2.5 cm',
      'Fontanela posterior (lambdoidea): triangular, más pequeña',
      'Sutura sagital: entre parietales',
      'Sutura coronal: entre frontal y parietales',
      'Sutura lambdoidea: entre occipital y parietales',
      'Moldeamiento: superposición de huesos sin daño',
    ],
  },
  {
    id: 'diametros-cefalicos',
    title: 'Diámetros del Cráneo Fetal',
    category: 'fetal',
    description: 'Los diámetros cefálicos determinan qué parte de la cabeza fetal atraviesa cada plano pélvico. El diámetro suboccipitobregmático es el menor.',
    clinicalRelevance: 'En la presentación de vértice bien flexionada, el diámetro suboccipitobregmático (9.5 cm) es el que atraviesa el estrecho superior. En deflexión, diámetros mayores comprometen el parto.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    imageSource: 'Ilustración médica educativa',
    measurements: [
      { label: 'Suboccipitobregmático', value: '9.5', unit: 'cm' },
      { label: 'Occipitofrontal', value: '11.5', unit: 'cm' },
      { label: 'Occipitomentoniano', value: '13.5', unit: 'cm' },
      { label: 'Biparietal', value: '9.5', unit: 'cm' },
      { label: 'Bitemporal', value: '8', unit: 'cm' },
    ],
    keyPoints: [
      'Flexión completa: presenta diámetro suboccipitobregmático',
      'Deflexión parcial: occipitofrontal (menos favorable)',
      'Cara: occipitomentoniano (parto difícil)',
      'Biparietal: diámetro transverso más importante',
    ],
  },

  // PLACENTA Y ANEXOS
  {
    id: 'placenta-estructura',
    title: 'Estructura de la Placenta',
    category: 'placenta',
    description: 'La placenta es un órgano feto-materno con dos caras: fetal (corion) y materna (decidua). Pesa 500-600g a término y mide 15-20 cm de diámetro.',
    clinicalRelevance: 'La inspección placentaria postparto es obligatoria para descartar retención de cotiledones (riesgo de hemorragia). Anomalías placentarias se asocian a complicaciones perinatales.',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    imageSource: 'Ilustración médica educativa',
    measurements: [
      { label: 'Diámetro', value: '15-20', unit: 'cm' },
      { label: 'Grosor', value: '2-3', unit: 'cm' },
      { label: 'Peso', value: '500-600', unit: 'g' },
      { label: 'Superficie', value: '200-300', unit: 'cm²' },
    ],
    keyPoints: [
      'Cara fetal: brillante, lisa, cubierta por amnios',
      'Cara materna: rugosa, 15-20 cotiledones',
      'Cordón: inserción central o paracentral (normal)',
      'Vellosidades coriónicas: unidad funcional',
      'Completar desarrollo: semana 12-14',
    ],
  },
  {
    id: 'cordon-umbilical',
    title: 'Cordón Umbilical',
    category: 'placenta',
    description: 'El cordón umbilical conecta el feto con la placenta. Contiene dos arterias y una vena, rodeadas por gelatina de Wharton.',
    clinicalRelevance: 'La arteria umbilical única (AUU) se asocia a anomalías congénitas (2-11%). Las circulares de cordón son comunes (25%) pero raramente causan asfixia. El prolapso es una emergencia obstétrica.',
    imageUrl: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&q=80',
    imageSource: 'Ilustración médica educativa',
    measurements: [
      { label: 'Longitud media', value: '50-60', unit: 'cm' },
      { label: 'Diámetro', value: '1.5-2', unit: 'cm' },
    ],
    keyPoints: [
      'Dos arterias umbilicales (llevan sangre desoxigenada)',
      'Una vena umbilical (lleva sangre oxigenada)',
      'Gelatina de Wharton: protege los vasos',
      'Cordón corto (<35cm): trabajo de parto prolongado',
      'Cordón largo (>70cm): mayor riesgo de prolapso y circulares',
    ],
  },

  // CANAL DEL PARTO
  {
    id: 'mecanismo-parto',
    title: 'Mecanismo del Parto en Presentación de Vértice',
    category: 'parto',
    description: 'Secuencia de movimientos pasivos que realiza el feto para atravesar el canal del parto: encajamiento, descenso, flexión, rotación interna, extensión, rotación externa y expulsión.',
    clinicalRelevance: 'Comprender el mecanismo del parto permite identificar distocias y aplicar maniobras correctivas. La rotación interna defectuosa causa variedades posteriores y trabajo de parto prolongado.',
    imageUrl: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&q=80',
    imageSource: 'Ilustración médica educativa',
    keyPoints: [
      '1. Encajamiento: biparietal atraviesa estrecho superior',
      '2. Descenso: progresión a través del canal',
      '3. Flexión: mentón al tórax, menor diámetro',
      '4. Rotación interna: occipucio hacia pubis (OA)',
      '5. Extensión: cabeza emerge bajo la sínfisis',
      '6. Rotación externa: hombros rotan (restitución)',
      '7. Expulsión: hombro anterior luego posterior',
    ],
  },
  {
    id: 'cuello-uterino',
    title: 'Borramiento y Dilatación del Cuello Uterino',
    category: 'parto',
    description: 'El cuello uterino se acorta (borramiento) y dilata durante el trabajo de parto, desde 0 a 10 cm. En nulíparas el borramiento precede a la dilatación.',
    clinicalRelevance: 'La evaluación del cuello (Bishop score) predice éxito de inducción. Dilatación completa (10 cm) permite el paso de la cabeza fetal. El tacto vaginal periódico monitorea progreso.',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80',
    imageSource: 'Ilustración médica educativa',
    measurements: [
      { label: 'Dilatación completa', value: '10', unit: 'cm' },
      { label: 'Borramiento', value: '0-100', unit: '%' },
    ],
    keyPoints: [
      'Borramiento: acortamiento del cuello (3cm → 0cm)',
      'Dilatación: apertura del orificio cervical interno',
      'Nulípara: borra primero, luego dilata',
      'Multípara: borramiento y dilatación simultáneos',
      'Score de Bishop: >8 favorable para inducción',
      'Fase latente: hasta 4-6 cm (lenta)',
      'Fase activa: 6-10 cm (rápida, 1cm/hora)',
    ],
  },

  // ÚTERO GRÁVIDO
  {
    id: 'utero-segmentos',
    title: 'Segmentos Uterinos en el Embarazo',
    category: 'utero',
    description: 'El útero grávido se divide en segmento superior (activo, contráctil) y segmento inferior (pasivo, se adelgaza). El anillo de Bandl marca la unión.',
    clinicalRelevance: 'En la cesárea, la incisión se realiza en el segmento inferior. El anillo de Bandl patológico indica obstrucción y riesgo de rotura uterina. El segmento superior no debe incidirse.',
    imageUrl: 'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=800&q=80',
    imageSource: 'Ilustración médica educativa',
    keyPoints: [
      'Segmento superior: fondo y cuerpo, grueso, contráctil',
      'Segmento inferior: istmo expandido, adelgazado',
      'Anillo de Bandl: unión entre segmentos (fisiológico)',
      'Formación gradual desde el 2º trimestre',
      'Incisión de cesárea: segmento inferior (menos sangrado)',
      'Rotura uterina: más común en segmento inferior',
    ],
  },
  {
    id: 'utero-crecimiento',
    title: 'Crecimiento Uterino por Trimestre',
    category: 'utero',
    description: 'El útero crece desde 70g (no grávido) a 1100g a término. La altura uterina correlaciona con edad gestacional hasta las 36 semanas.',
    clinicalRelevance: 'La medición de altura uterina (AU) es screening básico de crecimiento fetal. AU en cm ≈ semanas de gestación ±2cm. Discrepancias sugieren RCIU, macrosomía o polihidramnios.',
    imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',
    imageSource: 'Ilustración médica educativa',
    measurements: [
      { label: 'Peso uterino no grávido', value: '70', unit: 'g' },
      { label: 'Peso uterino a término', value: '1100', unit: 'g' },
      { label: 'Capacidad a término', value: '5000', unit: 'ml' },
    ],
    keyPoints: [
      '12 semanas: útero palpable sobre sínfisis púbica',
      '20 semanas: fondo en ombligo',
      '36 semanas: fondo en apéndice xifoides',
      '40 semanas: descenso por encajamiento',
      'Altura uterina: desde sínfisis a fondo uterino',
      'Hiperplasia hasta sem 20, luego hipertrofia',
    ],
  },
];

export function getItemsByCategory(category: string): AtlasItem[] {
  return ATLAS_ITEMS.filter(item => item.category === category);
}

export function getItemById(id: string): AtlasItem | undefined {
  return ATLAS_ITEMS.find(item => item.id === id);
}

export function searchAtlas(query: string): AtlasItem[] {
  const lowerQuery = query.toLowerCase();
  return ATLAS_ITEMS.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery) ||
    item.keyPoints.some(point => point.toLowerCase().includes(lowerQuery))
  );
}
