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

export interface Pet {
  id: string;
  user_id?: string;
  name: string;
  photo: string;
  species: string;
  birthdate: string;
  notes: string;
  created_at?: string;
}

export type CareType = 'Vacina' | 'Vermifugação' | 'Consulta' | 'Medicamento' | 'Outro';

export interface CareRecord {
  id: string;
  pet_id: string;
  user_id?: string;
  type: CareType | string;
  title: string;
  date: string;
  notes: string;
  next_due: string;
  created_at?: string;
}

export type CareCategory = 'saude' | 'alimentacao' | 'higiene' | 'passeio' | 'outro';

export interface CareTask {
  id: string;
  pet_id: string;
  user_id?: string;
  title: string;
  description: string;
  category: CareCategory | string;
  due_at: string;
  completed: boolean;
  completed_at: string | null;
  created_at?: string;
}

export type TabId = 'adoption' | 'donations' | 'reports' | 'care' | 'clinics' | 'wildlife' | 'account';
