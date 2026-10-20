import { useState } from 'react';
import { MapPin, Star, Clock, Phone, Navigation } from 'lucide-react';
import { clinics } from '@/data';
import type { Clinic } from '@/types';
import { AppHeader } from '@/components/AppHeader';

export function ClinicsScreen() {
  const [selected, setSelected] = useState<Clinic | null>(null);
  const sorted = [...clinics].sort((a, b) => a.distance - b.distance);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50/40 to-white pb-24">
      <AppHeader title="Guia de Clínicas" subtitle="Veterinários próximos de você" />

      <div className="px-4 pt-4">
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4 h-64 bg-gradient-to-br from-secondary-100 via-primary-50 to-secondary-50">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path d="M 0 120 Q 80 100 160 140 T 320 130" fill="none" stroke="#93c5fd" strokeWidth="3" opacity="0.4" />
            <path d="M 0 60 L 200 70 L 300 50" fill="none" stroke="#86efac" strokeWidth="4" opacity="0.3" />
          </svg>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-secondary-500 ring-4 ring-secondary-200 animate-pulse" />
              <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-secondary-400/30 animate-ping" />
            </div>
          </div>

          {sorted.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <div
                className={`p-2.5 rounded-full shadow-md transition-all duration-300 ${
                  selected?.id === c.id
                    ? 'bg-primary-600 scale-125 ring-4 ring-primary-200'
                    : 'bg-white hover:scale-110'
                }`}
              >
                <MapPin
                  size={18}
                  className={selected?.id === c.id ? 'text-white' : 'text-primary-600'}
                  fill={selected?.id === c.id ? 'white' : 'currentColor'}
                />
              </div>
            </button>
          ))}

          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
            <p className="text-xs font-medium text-gray-600">Sua localização</p>
          </div>
        </div>

        <div className="space-y-3">
          {sorted.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full text-left bg-white rounded-2xl shadow-sm border p-4 transition-all duration-200 ${
                selected?.id === c.id ? 'border-primary-300 ring-1 ring-primary-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {i === 0 && (
                    <span className="text-[10px] font-bold text-white bg-primary-500 px-2 py-0.5 rounded-full">
                      MAIS PRÓXIMA
                    </span>
                  )}
                  <h3 className="text-base font-bold text-gray-800">{c.name}</h3>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                  <Star size={14} className="text-amber-400" fill="currentColor" />
                  <span className="text-xs font-semibold text-amber-600">{c.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-500">{c.address}</p>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Navigation size={13} />
                    <span className="font-medium text-primary-600">{c.distance} km</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={13} />
                    {c.hours}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Phone size={13} />
                  {c.phone}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selected.name}</h2>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={16} className="text-amber-400" fill="currentColor" />
                  <span className="text-sm font-semibold text-amber-600">{selected.rating}</span>
                  <span className="text-sm text-gray-400">· {selected.distance} km de distância</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full bg-gray-100">
                <span className="text-gray-500 text-sm">✕</span>
              </button>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-primary-500" />
                {selected.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-primary-500" />
                {selected.hours}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} className="text-primary-500" />
                {selected.phone}
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-md shadow-primary-200 hover:bg-primary-600 transition-colors flex items-center justify-center gap-2">
              <Navigation size={16} />
              Como Chegar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
