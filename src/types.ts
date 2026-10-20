export type Species = 'Cão' | 'Gato' | 'Outro';

export interface Animal {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: string;
  gender: 'Macho' | 'Fêmea';
  photo: string;
  description: string;
  vaccinated: boolean;
  neutered: boolean;
}

export type DonationCategory = 'Ração' | 'Medicamentos' | 'Brinquedos' | 'Acessórios' | 'Higiene';

export interface DonationItem {
  id: string;
  title: string;
  category: DonationCategory;
  description: string;
  donor: string;
  city: string;
  contact: string;
  type: 'offer' | 'request';
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  phone: string;
  hours: string;
  x: number;
  y: number;
}

export type RepeatInterval = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Reminder {
  id: string;
  title: string;
  petName: string;
  datetime: string;
  repeat: RepeatInterval;
  completed: boolean;
}

export type TabId = 'adoption' | 'donations' | 'reports' | 'reminders' | 'clinics';
