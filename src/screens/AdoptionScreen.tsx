import { useState } from 'react';
import { Heart, MapPin, Check, X, ChevronLeft } from 'lucide-react';
import type { Animal } from '@/types';
import { animals } from '@/data';
import { AppHeader } from '@/components/AppHeader';

export function AdoptionScreen() {
  const [interested, setInterested] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Animal | null>(null);

  const toggleInterest = (id: string) => {
    setInterested((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/40 to-white pb-24">
      <AppHeader title="Painel de Adoção" subtitle="Encontre seu novo melhor amigo" />

      <div className="px-4 pt-4 space-y-4">
        {animals.map((animal) => (
          <div
            key={animal.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up"
          >
            <div className="relative" onClick={() => setSelected(animal)}>
              <img
                src={animal.photo}
                alt={animal.name}
                className="w-full h-52 object-cover cursor-pointer"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {animal.species}
                </span>
                <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {animal.gender}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleInterest(animal.id);
                }}
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 active:scale-90 ${
                  interested.has(animal.id)
                    ? 'bg-primary-500 shadow-md shadow-primary-300 animate-scale-in'
                    : 'bg-white/80 hover:bg-white'
                }`}
              >
                <Heart
                  size={18}
                  className={interested.has(animal.id) ? 'text-white' : 'text-gray-500'}
                  fill={interested.has(animal.id) ? 'white' : 'none'}
                />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{animal.name}</h3>
                  <p className="text-sm text-gray-500">{animal.breed}</p>
                </div>
                <span className="text-sm font-medium text-gray-400">{animal.age}</span>
              </div>

              <div className="flex gap-2 mb-3">
                {animal.vaccinated && (
                  <span className="flex items-center gap-1 text-xs text-success-700 bg-success-50 px-2 py-1 rounded-lg">
                    <Check size={12} /> Vacinado
                  </span>
                )}
                {animal.neutered && (
                  <span className="flex items-center gap-1 text-xs text-secondary-700 bg-secondary-50 px-2 py-1 rounded-lg">
                    <Check size={12} /> Castrado
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleInterest(animal.id)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    interested.has(animal.id)
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {interested.has(animal.id) ? '✓ Tenho Interesse' : 'Tenho Interesse'}
                </button>
                <button
                  onClick={() => toggleInterest(animal.id)}
                  className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 active:scale-90 ${
                    interested.has(animal.id)
                      ? 'bg-error-50 shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Heart
                    size={20}
                    className={interested.has(animal.id) ? 'text-error-500' : 'text-gray-400'}
                    fill={interested.has(animal.id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-5 animate-slide-up max-h-[80vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
              <button
                onClick={() => setSelected(null)}
                className="ml-auto p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <img src={selected.photo} alt={selected.name} className="w-full h-64 object-cover rounded-2xl mb-4" />
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-800">{selected.name}</h2>
              <span className="text-sm text-gray-400 mt-1">{selected.age}</span>
            </div>
            <p className="text-gray-500 mb-3">{selected.breed} · {selected.gender}</p>
            <p className="text-gray-600 leading-relaxed mb-4">{selected.description}</p>
            <div className="flex gap-2 mb-4">
              {selected.vaccinated && (
                <span className="flex items-center gap-1 text-xs text-success-700 bg-success-50 px-3 py-1.5 rounded-lg">
                  <Check size={14} /> Vacinado
                </span>
              )}
              {selected.neutered && (
                <span className="flex items-center gap-1 text-xs text-secondary-700 bg-secondary-50 px-3 py-1.5 rounded-lg">
                  <Check size={14} /> Castrado
                </span>
              )}
            </div>
            <button
              onClick={() => {
                toggleInterest(selected.id);
                setSelected(null);
              }}
              className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold shadow-md shadow-primary-200 hover:bg-primary-600 transition-colors"
            >
              Tenho Interesse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
