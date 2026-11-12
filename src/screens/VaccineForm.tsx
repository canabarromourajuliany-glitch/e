import { useState } from 'react';
import { CalendarClock, Calendar, Syringe, X } from 'lucide-react';
import type { CareRecord } from '@/types';

export interface VaccineFormValues {
  title: string;
  date: string;
  notes: string;
  next_due: string;
}

interface VaccineFormProps {
  record?: CareRecord | null;
  initialTitle?: string;
  onClose: () => void;
  onSave: (values: VaccineFormValues) => void;
}

const suggestions = ['V8', 'V10', 'Antirrábica', 'Gripe canina', 'Gripe felina', 'Tríplice felina', 'Leishmaniose'];

export function VaccineForm({ record, initialTitle = '', onClose, onSave }: VaccineFormProps) {
  const [title, setTitle] = useState(record?.title ?? initialTitle);
  const [date, setDate] = useState(record?.date ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(record?.notes ?? '');
  const [nextDue, setNextDue] = useState(record?.next_due ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Informe o nome da vacina';
    if (!date) next.date = 'Informe a data de aplicação';
    if (nextDue && date && nextDue < date) next.next_due = 'A próxima dose deve ser depois da aplicação';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({ title: title.trim(), date, notes: notes.trim(), next_due: nextDue });
    onClose();
  };

  const inputClass = (field: string) => `field mt-1 ${errors[field] ? 'border-error-400 bg-error-50/30' : ''}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-5 animate-slide-up max-h-[88vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent-100 text-accent-700"><Syringe size={18} /></div>
            <h2 className="font-serif text-2xl text-primary-900">{record ? 'Corrigir vacina' : 'Nova vacina'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100" aria-label="Fechar"><X size={18} className="text-gray-600" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Nome da vacina</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: V10 - 1ª dose" className={inputClass('title')} />
            {errors.title && <p className="text-xs text-error-500 mt-1">{errors.title}</p>}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => setTitle(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${title === s ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-gray-600 hover:bg-secondary-200'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider"><Calendar size={13} />Aplicação</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass('date')} />
              {errors.date && <p className="text-xs text-error-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider"><CalendarClock size={13} />Próxima dose</label>
              <input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} className={inputClass('next_due')} />
              {errors.next_due && <p className="text-xs text-error-500 mt-1">{errors.next_due}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Lote, clínica ou veterinário, reações observadas..." rows={3} className="field mt-1 resize-none" />
          </div>

          <button onClick={submit} className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm">
            {record ? 'Salvar correção' : 'Adicionar à carteirinha'}
          </button>
        </div>
      </div>
    </div>
  );
}
