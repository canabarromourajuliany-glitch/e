import { useState, useRef } from 'react';
import { Bell, Plus, Clock, PawPrint, ChevronLeft, ChevronRight, Check, Trash2, X, Calendar, Tag } from 'lucide-react';
import type { Reminder, RepeatInterval } from '@/types';
import { AppHeader } from '@/components/AppHeader';

interface RemindersScreenProps {
  reminders: Reminder[];
  onAdd: (title: string, petName: string, datetime: string, repeat: RepeatInterval) => void;
  onComplete: (id: string) => void;
  onPostpone: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDateLabel(iso: string): { day: string; time: string; relative: string } {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);

  let day: string;
  if (diff === 0) day = 'Hoje';
  else if (diff === 1) day = 'Amanhã';
  else if (diff === -1) day = 'Ontem';
  else day = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  let relative: string;
  if (diff === 0) relative = 'Hoje';
  else if (diff === 1) relative = 'Amanhã';
  else relative = day;
  return { day, time, relative };
}

const repeatLabels: Record<RepeatInterval, string> = {
  none: 'Sem repetição',
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export function RemindersScreen({ reminders, onAdd, onComplete, onPostpone, onDelete }: RemindersScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const upcoming = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed);

  const scrollCarousel = (dir: number) => {
    carouselRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/30 to-white pb-24">
      <AppHeader title="Central de Lembretes" subtitle="Cuidados diários com seu pet" />

      <div className="px-4 pt-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">Próximos Alarmes</h2>
            <div className="flex gap-1">
              <button
                onClick={() => scrollCarousel(-1)}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              <button
                onClick={() => scrollCarousel(1)}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          {upcoming.length > 0 ? (
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
            >
              {upcoming.map((r) => {
                const { day, time, relative } = formatDateLabel(r.datetime);
                return (
                  <div
                    key={r.id}
                    className="snap-start flex-shrink-0 w-[260px] bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary-100 p-2 rounded-xl">
                          <Bell size={18} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-primary-600">{relative}</p>
                          <p className="text-xs text-gray-400">{time}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDelete(r.id)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Trash2 size={14} className="text-gray-300" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-gray-800 mb-1">{r.title}</h3>
                    <div className="flex items-center gap-1.5 mb-3">
                      <PawPrint size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{r.petName}</span>
                      {r.repeat !== 'none' && (
                        <span className="text-xs text-gray-300">· {repeatLabels[r.repeat]}</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onPostpone(r.id)}
                        className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Adiar
                      </button>
                      <button
                        onClick={() => onComplete(r.id)}
                        className="flex-1 py-2 rounded-lg bg-primary-500 text-white text-xs font-semibold shadow-sm hover:bg-primary-600 transition-colors"
                      >
                        Concluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Bell size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nenhum alarme ativo. Toque em + para adicionar.</p>
            </div>
          )}
        </div>

        {completed.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Concluídos</h2>
            <div className="space-y-2">
              {completed.map((r) => {
                const { time } = formatDateLabel(r.datetime);
                return (
                  <div
                    key={r.id}
                    className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 opacity-60"
                  >
                    <div className="bg-success-100 p-1.5 rounded-lg">
                      <Check size={16} className="text-success-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 line-through">{r.title}</p>
                      <p className="text-xs text-gray-400">{r.petName} · {time}</p>
                    </div>
                    <button onClick={() => onDelete(r.id)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                      <Trash2 size={14} className="text-gray-300" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-300 flex items-center justify-center hover:scale-110 transition-transform duration-200 active:scale-95"
      >
        <Plus size={28} />
      </button>

      {showForm && (
        <ReminderForm
          onClose={() => setShowForm(false)}
          onAdd={(title, petName, datetime, repeat) => {
            onAdd(title, petName, datetime, repeat);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function ReminderForm({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (title: string, petName: string, datetime: string, repeat: RepeatInterval) => void;
}) {
  const [title, setTitle] = useState('');
  const [petName, setPetName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [repeat, setRepeat] = useState<RepeatInterval>('none');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Obrigatório';
    if (!petName.trim()) newErrors.petName = 'Obrigatório';
    if (!date) newErrors.date = 'Obrigatório';
    if (!time) newErrors.time = 'Obrigatório';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const iso = new Date(`${date}T${time}`).toISOString();
      onAdd(title, petName, iso, repeat);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end animate-fade-in" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl p-5 animate-slide-up max-h-[85vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Novo Lembrete</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-1.5">
              <Tag size={15} className="text-gray-400" /> Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Vacina de Raiva"
              className={`w-full px-4 py-3 rounded-xl text-sm transition-all ${
                errors.title
                  ? 'border-2 border-error-400 bg-error-50/30'
                  : 'border border-gray-200 focus:border-primary-400'
              } focus:outline-none`}
            />
            {errors.title && <p className="text-xs text-error-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-1.5">
              <PawPrint size={15} className="text-gray-400" /> Nome do Pet
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Ex: Bob"
              className={`w-full px-4 py-3 rounded-xl text-sm transition-all ${
                errors.petName
                  ? 'border-2 border-error-400 bg-error-50/30'
                  : 'border border-gray-200 focus:border-primary-400'
              } focus:outline-none`}
            />
            {errors.petName && <p className="text-xs text-error-500 mt-1">{errors.petName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-1.5">
                <Calendar size={15} className="text-gray-400" /> Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-3 rounded-xl text-sm transition-all ${
                  errors.date
                    ? 'border-2 border-error-400 bg-error-50/30'
                    : 'border border-gray-200 focus:border-primary-400'
                } focus:outline-none`}
              />
              {errors.date && <p className="text-xs text-error-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-1.5">
                <Clock size={15} className="text-gray-400" /> Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full px-3 py-3 rounded-xl text-sm transition-all ${
                  errors.time
                    ? 'border-2 border-error-400 bg-error-50/30'
                    : 'border border-gray-200 focus:border-primary-400'
                } focus:outline-none`}
              />
              {errors.time && <p className="text-xs text-error-500 mt-1">{errors.time}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Repetição</label>
            <div className="grid grid-cols-4 gap-2">
              {(['none', 'daily', 'weekly', 'monthly'] as RepeatInterval[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRepeat(r)}
                  className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                    repeat === r
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {r === 'none' ? 'Sem' : r === 'daily' ? 'Diário' : r === 'weekly' ? 'Seman.' : 'Mensal'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-md shadow-primary-200 hover:bg-primary-600 transition-colors"
          >
            Criar Lembrete
          </button>
        </div>
      </div>
    </div>
  );
}
