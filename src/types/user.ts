export type UserRole = 
  | 'CITIZEN'
  | 'SANITARY_INSPECTOR'
  | 'JUNIOR_ENGINEER'
  | 'COMMISSIONER'
  | 'ADMIN';

export interface UserPersona {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  avatar: string;
  department?: string;
  wardAssigned?: number; // e.g. Ward 12
  phone: string;
}

export const PRESET_PERSONAS: UserPersona[] = [
  {
    id: 'citizen-1',
    name: 'Karthik Subburam',
    role: 'CITIZEN',
    designation: 'Citizen (Mahalingapuram, Ward 14)',
    avatar: '👨‍💼',
    phone: '98421-54321'
  },
  {
    id: 'si-murugesan',
    name: 'S. Murugesan',
    role: 'SANITARY_INSPECTOR',
    designation: 'Sanitary Inspector (Ward 14 & 15)',
    avatar: '👷‍♂️',
    department: 'dept-sanitation',
    wardAssigned: 14,
    phone: '94432-88102'
  },
  {
    id: 'je-anbarasan',
    name: 'Er. R. Anbarasan, B.E.',
    role: 'JUNIOR_ENGINEER',
    designation: 'Junior Engineer (Water & Civil Infrastructure)',
    avatar: '🧑‍🔧',
    department: 'dept-water',
    wardAssigned: 14,
    phone: '94430-12948'
  },
  {
    id: 'commissioner-selvam',
    name: 'Dr. T. Selvam, IAS (Retd.)',
    role: 'COMMISSIONER',
    designation: 'Municipal Commissioner, Pollachi',
    avatar: '🏛️',
    phone: '04259-223344'
  }
];
