import { useState } from 'react';
import { HandHeart, ChevronRight, Phone, MapPin, Heart } from 'lucide-react';
import { donations } from '@/data';
import type { DonationCategory } from '@/types';
import { AppHeader } from '@/components/AppHeader';

const categoryColors: Record<DonationCategory, string> = {
  'Ração': 'bg-accent-50 text-accent-700',
  'Medicamentos': 'bg-secondary-50 text-secondary-700',
  'Brinquedos': 'bg-warning-50 text-warning-700',
  'Acessórios': 'bg-primary-50 text-primary-700',
  'Higiene': 'bg-error-50 text-error-700',
};

type TabType = 'offer' | 'request';

export function DonationsScreen() {
  const [tab, setTab] = useState<TabType>('offer');
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const filtered = donations.filter((d) => d.type === tab);

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50/40 to-white pb-24">
      <AppHeader title="Doações de Insumos" subtitle="Ajude quem cuida dos animais" />

      <div className="px-4 pt-4">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          <button
            onClick={() => setTab('offer')}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
              tab === 'offer' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            Quero Doar
          </button>
          <button
            onClick={() => setTab('request')}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
              tab === 'request' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            Preciso de Ajuda
          </button>
        </div>

        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-slide-up"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${categoryColors[item.category]}`}>
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-gray-800 leading-snug">{item.title}</h3>
                </div>
                <div className={`ml-2 flex-shrink-0 p-2 rounded-xl ${tab === 'offer' ? 'bg-primary-50' : 'bg-accent-50'}`}>
                  <HandHeart size={20} className={tab === 'offer' ? 'text-primary-600' : 'text-accent-600'} />
                </div>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed mb-3">{item.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">{item.donor}</p>
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{item.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(item.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 active:scale-90 ${
                      liked.has(item.id)
                        ? 'bg-error-50 shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <Heart
                      size={18}
                      className={liked.has(item.id) ? 'text-error-500' : 'text-gray-400'}
                      fill={liked.has(item.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                  <a
                    href={`tel:${item.contact.replace(/\D/g, '')}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-2 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Phone size={14} />
                    Contato
                    <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Nenhuma doação disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
