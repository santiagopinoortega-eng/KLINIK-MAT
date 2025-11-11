export interface MetodoAnticonceptivo {
  id: string;
  nombre: string;
  tipo: 'Hormonal' | 'Barrera' | 'DIU' | 'Natural' | 'Emergencia' | 'Quirúrgico';
  descripcion: string;
  efectividad: string;
  mecanismo: string;
  ventajas: string[];
  desventajas: string[];
  criterios: string; // Link to MINSAL criteria
}

export const METODOS_ANTICONCEPTIVOS: MetodoAnticonceptivo[] = [
  {
    id: 'anticonceptivos-orales-combinados',
    nombre: 'Anticonceptivos Orales Combinados (ACO)',
    tipo: 'Hormonal',
    descripcion: 'Píldoras que contienen estrógeno y progestina. Se toman diariamente para prevenir el embarazo.',
    efectividad: '99.7% con uso perfecto, 91% con uso típico.',
    mecanismo: 'Inhiben la ovulación, espesan el moco cervical y alteran el endometrio.',
    ventajas: [
      'Alta efectividad.',
      'Regulan el ciclo menstrual.',
      'Disminuyen el acné.',
      'Reducen el riesgo de cáncer de ovario y endometrio.',
    ],
    desventajas: [
      'Requieren toma diaria.',
      'No protegen contra ITS.',
      'Pueden tener efectos secundarios como náuseas, cefaleas, etc.',
      'Aumentan el riesgo de eventos trombóticos en mujeres con factores de riesgo.',
    ],
    criterios: 'https://www.minsal.cl/portal/url/item/78bf5e5433252d16e04001011f014555.pdf',
  },
  {
    id: 'condon-masculino',
    nombre: 'Condón Masculino',
    tipo: 'Barrera',
    descripcion: 'Funda de látex o poliuretano que se coloca en el pene erecto antes de la relación sexual.',
    efectividad: '98% con uso perfecto, 82% con uso típico.',
    mecanismo: 'Impide que los espermatozoides entren en la vagina.',
    ventajas: [
        'Protege contra la mayoría de las ITS.',
        'Ampliamente disponible y de bajo costo.',
        'No tiene efectos secundarios hormonales.',
    ],
    desventajas: [
        'Puede romperse o deslizarse.',
        'Requiere uso correcto en cada relación sexual.',
        'Puede disminuir la sensibilidad.',
    ],
    criterios: 'https://www.minsal.cl/portal/url/item/78bf5e5433252d16e04001011f014555.pdf',
  },
  {
    id: 'diu-cobre',
    nombre: 'DIU de Cobre',
    tipo: 'DIU',
    descripcion: 'Dispositivo intrauterino pequeño y flexible que no contiene hormonas. Es insertado en el útero por un profesional de la salud.',
    efectividad: 'Más del 99% de efectividad.',
    mecanismo: 'El cobre tiene un efecto espermicida e interfiere con el proceso de fertilización y la implantación.',
    ventajas: [
      'Larga duración (hasta 10-12 años).',
      'No requiere acción diaria por parte de la usuaria.',
      'Sin hormonas, por lo que no tiene efectos secundarios hormonales.',
      'Puede ser usado como anticonceptivo de emergencia.',
    ],
    desventajas: [
      'Puede aumentar el sangrado menstrual y los cólicos.',
      'Requiere inserción y extracción por un profesional.',
      'No protege contra ITS.',
    ],
    criterios: 'https://www.minsal.cl/portal/url/item/78bf5e5433252d16e04001011f014555.pdf',
  },
  {
    id: 'diu-levonorgestrel',
    nombre: 'DIU con Levonorgestrel',
    tipo: 'DIU',
    descripcion: 'Dispositivo intrauterino que libera una pequeña cantidad de la hormona progestina (levonorgestrel). Es insertado en el útero por un profesional de la salud.',
    efectividad: 'Más del 99% de efectividad.',
    mecanismo: 'Espesa el moco cervical, inhibe la motilidad de los espermatozoides y suprime el crecimiento del endometrio.',
    ventajas: [
      'Larga duración (hasta 5 años).',
      'Reduce significativamente el sangrado menstrual y los cólicos.',
      'Alta efectividad.',
    ],
    desventajas: [
      'Puede causar sangrado irregular o manchado, especialmente en los primeros meses.',
      'Requiere inserción y extracción por un profesional.',
      'No protege contra ITS.',
    ],
    criterios: 'https://www.minsal.cl/portal/url/item/78bf5e5433252d16e04001011f014555.pdf',
  },
  {
    id: 'parche-anticonceptivo',
    nombre: 'Parche Anticonceptivo',
    tipo: 'Hormonal',
    descripcion: 'Un parche adhesivo que se coloca en la piel y libera estrógeno y progestina. Se cambia semanalmente.',
    efectividad: '99.7% con uso perfecto, 91% con uso típico.',
    mecanismo: 'Inhibe la ovulación, espesa el moco cervical y altera el endometrio.',
    ventajas: [
      'Solo se necesita cambiar una vez por semana.',
      'Efectividad no se ve afectada por vómitos o diarrea.',
      'Regula el ciclo menstrual.',
    ],
    desventajas: [
      'Puede causar irritación en la piel.',
      'Visible en la piel.',
      'No protege contra ITS.',
      'Riesgo de desprendimiento.',
    ],
    criterios: 'https://www.minsal.cl/portal/url/item/78bf5e5433252d16e04001011f014555.pdf',
  }
];