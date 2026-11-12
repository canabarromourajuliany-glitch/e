import { useState } from 'react';
import { Syringe, Plus, Pencil, Trash2, CalendarClock, CheckCircle2, AlertCircle, PawPrint, ShieldCheck } from 'lucide-react';
import type { CareRecord, Pet } from '@/types';
import { formatDay, daysFromToday } from '@/lib/dates';
import { VaccineForm, type VaccineFormValues } from '@/screens/VaccineForm';

interface VaccineBookletProps {
  pet: Pet;
  records: CareRecord[];
  onAdd: (values: VaccineFormValues) => void;
  onUpdate: (id: string, values: VaccineFormValues) => void;
  onDelete: (id: string) => void;
}

type FormState = { mode: 'closed' } | { mode: 'create'; initialTitle: string } | { mode: 'edit'; record: CareRecord };

function doseStatus(nextDue: string) {
  const days = daysFromToday(nextDue);
  if (days < 0) return { label: `Atrasada há ${Math.abs(days)} dia(s)`, box: 'bg-error-50 border-error-200', text: 'text-error-700', icon: AlertCircle };
  if (days <= 30) return { label: days === 0 ? 'Hoje' : `Em ${days} dia(s)`, box: 'bg-accent-50 border-accent-200', text: 'text-accent-700', icon: CalendarClock };
  return { label: `Em ${days} dias`, box: 'bg-primary-50 border-primary-200', text: 'text-primary-700', icon: CalendarClock };
}

export function VaccineBooklet({ pet, records, onAdd, onUpdate, onDelete }: VaccineBookletProps) {
  const [form, setForm] = useState<FormState>({ mode: 'closed' });

  const vaccines = records.filter((r) => r.type === 'Vacina');
  const history = [...vaccines].sort((a, b) => b.date.localeCompare(a.date));
  const upcoming = vaccines.filter((r) => r.next_due).sort((a, b) => a.next_due.localeCompare(b.next_due));

  const handleSave = (values: VaccineFormValues) => {
    if (form.mode === 'edit') onUpdate(form.record.id, values);
    else onAdd(values);
  };

  return (
    <div className="space-y-5">
      {/* Booklet cover */}
      <div className="relative overflow-hidden rounded-3xl bg-primary-700 text-white shadow-md">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-500/20" />
        <div className="absolute -right-2 bottom-6 h-16 w-16 rounded-full bg-white/5" />
        <div className="relative p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-300">Carteira de vacinação</p>
            <ShieldCheck size={20} className="text-accent-300" />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 flex items-center justify-center">
              {pet.photo ? <img src={pet.photo} alt={pet.name} className="h-full w-full object-cover" /> : <PawPrint size={26} className="text-white/80" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-2xl truncate">{pet.name}</h3>
              <p className="text-xs text-white/75">{pet.species}{pet.birthdate ? ` · nascido em ${formatDay(pet.birthdate)}` : ''}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-white/10 py-2.5">
              <p className="font-serif text-2xl">{vaccines.length}</p>
              <p className="text-[11px] text-white/75">Vacinas registradas</p>
            </div>
            <div className="rounded-xl bg-white/10 py-2.5">
              <p className="font-serif text-2xl">{upcoming.length}</p>
              <p className="text-[11px] text-white/75">Próximas doses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-primary-900">Pendentes e próximas datas</h2>
      </div>

      {upcoming.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-secondary-300 p-5 text-center text-sm text-gray-500">
          Nenhuma dose ou reforço agendado. Ao registrar uma vacina, informe a próxima dose para acompanhar aqui.
        </div>
      ) : (
        <div className="space-y-2.5">
          {upcoming.map((rec) => {
            const status = doseStatus(rec.next_due);
            const StatusIcon = status.icon;
            return (
              <div key={rec.id} className={`flex items-center gap-3 rounded-2xl border p-3.5 ${status.box}`}>
                <StatusIcon size={18} className={`${status.text} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-primary-900 truncate">{rec.title}</p>
                  <p className="text-xs text-gray-600">{formatDay(rec.next_due)} · <span className={`font-semibold ${status.text}`}>{status.label}</span></p>
                </div>
                <button onClick={() => setForm({ mode: 'create', initialTitle: rec.title })}
                  className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-primary-700 shadow-sm hover:bg-primary-50">Registrar</button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-primary-900">Histórico de vacinação</h2>
        <button onClick={() => setForm({ mode: 'create', initialTitle: '' })} className="flex items-center gap-1 text-sm font-bold text-accent-700"><Plus size={16} />Nova vacina</button>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-secondary-300 p-8 text-center">
          <Syringe className="mx-auto mb-2 text-gray-300" size={32} />
          <p className="text-sm text-gray-500">Nenhuma vacina registrada para {pet.name} ainda.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-secondary-200 shadow-sm overflow-hidden">
          {history.map((rec, index) => (
            <div key={rec.id} className={`flex gap-3 p-4 ${index > 0 ? 'border-t border-dashed border-secondary-300' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                <Syringe size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-primary-900 text-sm truncate">{rec.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><CheckCircle2 size={12} className="text-success-600" />Aplicada em {formatDay(rec.date)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => setForm({ mode: 'edit', record: rec })} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Editar vacina"><Pencil size={14} className="text-gray-500" /></button>
                    <button onClick={() => { if (confirm(`Remover "${rec.title}" da carteirinha?`)) onDelete(rec.id); }} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Remover vacina"><Trash2 size={14} className="text-gray-400" /></button>
                  </div>
                </div>
                {rec.notes && <p className="text-sm text-gray-600 mt-2">{rec.notes}</p>}
                {rec.next_due && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-secondary-100 px-2 py-1 text-[11px] font-semibold text-primary-700">
                    <CalendarClock size={12} />Próxima dose: {formatDay(rec.next_due)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="rounded-xl bg-secondary-100 border border-secondary-200 p-3 text-xs leading-relaxed text-gray-600">
        Esta carteirinha serve para organização e acompanhamento. Ela não substitui a avaliação nem as orientações de um médico-veterinário.
      </p>

      {form.mode !== 'closed' && (
        <VaccineForm
          record={form.mode === 'edit' ? form.record : null}
          initialTitle={form.mode === 'create' ? form.initialTitle : ''}
          onClose={() => setForm({ mode: 'closed' })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
