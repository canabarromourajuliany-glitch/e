import { Heart, HandHeart, ShieldAlert, Bell, MapPin } from 'lucide-react';
import type { TabId } from '@/types';

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const items: { id: TabId; label: string; icon: typeof Heart }[] = [
  { id: 'adoption', label: 'Adoção', icon: Heart },
  { id: 'donations', label: 'Doações', icon: HandHeart },
  { id: 'reports', label: 'Denúncias', icon: ShieldAlert },
  { id: 'reminders', label: 'Lembretes', icon: Bell },
  { id: 'clinics', label: 'Clínicas', icon: MapPin },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary-800 shadow-[0_-2px_12px_rgba(0,0,0,0.25)]">
      <div className="mx-auto max-w-md flex items-center justify-around px-1 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[58px] transition-all duration-200"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-primary-400/70 scale-110 shadow-md' : 'scale-100'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={2}
                  className="text-white transition-colors duration-200"
                  fill={isActive ? 'currentColor' : 'none'}
                />
              </div>
              <span
                className={`text-[10px] font-medium leading-none transition-all duration-200 ${
                  isActive ? 'text-white font-semibold' : 'text-white/65'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
