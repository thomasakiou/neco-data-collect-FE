export interface School {
  id: string;
  name: string;
  custodianId: string;
  email: string;
  lastAccreditationDate: string;
  gender: 'Girls' | 'Boys' | 'Mixed';
  ownership: 'Private' | 'Public' | 'Federal';
  lga: string;
  town: string;
}

export interface Custodian {
  id: string;
  name: string;
}

export const CUSTODIANS: Custodian[] = [
  { id: 'c1', name: 'Minna Custodian Area' },
  { id: 'c2', name: 'Bida Custodian Area' },
  { id: 'c3', name: 'Suleja Custodian Area' },
  { id: 'c4', name: 'Kontagora Custodian Area' },
  { id: 'c5', name: 'Lapai Custodian Area' },
];

export const SCHOOLS: School[] = [
  // Minna
  {
    id: 's1',
    name: 'Government Science College, Minna',
    custodianId: 'c1',
    email: 'gscminna@edu.ng',
    lastAccreditationDate: '2023-05-15',
    gender: 'Boys',
    ownership: 'Public',
    lga: 'Chanchaga',
    town: 'Minna',
  },
  {
    id: 's2',
    name: 'Father O\'Connell Science College',
    custodianId: 'c1',
    email: 'foconnell@gmail.com',
    lastAccreditationDate: '2022-11-20',
    gender: 'Boys',
    ownership: 'Private',
    lga: 'Chanchaga',
    town: 'Minna',
  },
  // Bida
  {
    id: 's3',
    name: 'Government Girls Secondary School, Bida',
    custodianId: 'c2',
    email: 'ggssbida@yahoo.com',
    lastAccreditationDate: '2024-01-10',
    gender: 'Girls',
    ownership: 'Public',
    lga: 'Bida',
    town: 'Bida',
  },
  {
    id: 's4',
    name: 'Federal Government College, Bida',
    custodianId: 'c2',
    email: 'fgcbida@fed.gov.ng',
    lastAccreditationDate: '2023-09-12',
    gender: 'Mixed',
    ownership: 'Federal',
    lga: 'Bida',
    town: 'Bida',
  },
  // Suleja
  {
    id: 's5',
    name: 'Suleja Academy',
    custodianId: 'c3',
    email: 'suleja_academy@edu.ng',
    lastAccreditationDate: '2022-03-05',
    gender: 'Mixed',
    ownership: 'Public',
    lga: 'Suleja',
    town: 'Suleja',
  },
  {
    id: 's6',
    name: 'Government Secondary School, Suleja',
    custodianId: 'c3',
    email: 'gsssuleja@gmail.com',
    lastAccreditationDate: '2023-08-22',
    gender: 'Mixed',
    ownership: 'Public',
    lga: 'Suleja',
    town: 'Suleja',
  },
];
