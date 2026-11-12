import { useRef, useState } from 'react';
import { PawPrint, X, Camera, Dog, Cat, Bird, Rabbit, Fish } from 'lucide-react';
import type { Pet } from '@/types';
import { uploadPetPhoto } from '@/lib/petPhotos';

interface PetFormProps {
  onClose: () => void;
  onSave: (data: Omit<Pet, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  pet?: Pet | null;
}

const speciesOptions = [
  { value: 'Cão', icon: Dog },
  { value: 'Gato', icon: Cat },
  { value: 'Pássaro', icon: Bird },
  { value: 'Coelho', icon: Rabbit },
  { value: 'Peixe', icon: Fish },
  { value: 'Outro', icon: PawPrint },
];

export function PetForm({ onClose, onSave, pet }: PetFormProps) {
  const [name, setName] = useState(pet?.name || '');
  const [photo, setPhoto] = useState(pet?.photo || '');
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [species, setSpecies] = useState(pet?.species || 'Cão');
  const [birthdate, setBirthdate] = useState(pet?.birthdate || '');
  const [notes, setNotes] = useState(pet?.notes || '');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim()) { setError('O nome é obrigatório'); return; }
    setSaving(true);
    setSaveError('');
    const saved = await onSave({ name: name.trim(), photo, species, birthdate, notes });
    setSaving(false);
    if (saved) onClose();
    else setSaveError('Não foi possível salvar o animal. Tente novamente.');
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError('');
    setUploading(true);
    try {
      setPhoto(await uploadPetPhoto(file));
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Não foi possível enviar a foto.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl animate-slide-up max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <h2 className="font-serif text-2xl text-primary-900">{pet ? 'Editar cadastro' : 'Novo animal'}</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100"><X size={18} className="text-gray-600" /></button>
        </div>

        <div className="space-y-4 overflow-y-auto no-scrollbar px-5 pb-5 flex-1 min-h-0">
          <div className="flex flex-col items-center gap-2">
            <div className="h-24 w-24 rounded-2xl bg-secondary-100 border-2 border-dashed border-secondary-300 flex items-center justify-center overflow-hidden">
              {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <Camera size={28} className="text-gray-400" />}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="rounded-lg bg-secondary-100 px-3.5 py-2 text-xs font-semibold text-primary-700 transition-all hover:bg-secondary-200 disabled:opacity-60">
                {uploading ? 'Enviando...' : photo ? 'Trocar foto' : 'Escolher da galeria'}
              </button>
              {photo && !uploading && (
                <button type="button" onClick={() => setPhoto('')}
                  className="rounded-lg px-3.5 py-2 text-xs font-semibold text-error-600 transition-all hover:bg-error-50">
                  Remover
                </button>
              )}
            </div>
            {photoError && <p className="text-xs text-error-500 text-center">{photoError}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Bob" className="field mt-1" />
            {error && <p className="text-xs text-error-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Espécie</label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {speciesOptions.map(({ value, icon: Icon }) => (
                <button key={value} onClick={() => setSpecies(value)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${species === value ? 'bg-primary-500 text-white shadow-sm' : 'bg-secondary-100 text-gray-600'}`}>
                  <Icon size={18} />{value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Data de nascimento</label>
            <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="field mt-1" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alergias, condições especiais, preferências..." rows={3} className="field mt-1 resize-none" />
          </div>

        </div>

        <div className="border-t border-secondary-200 bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
          {saveError && <p className="text-sm text-error-600 text-center">{saveError}</p>}
          <button onClick={submit} disabled={uploading || saving} className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm transition-colors hover:bg-primary-700 disabled:opacity-60">
            {saving ? 'Salvando...' : pet ? 'Salvar alterações' : 'Salvar animal'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CareRecordFormProps {
  onClose: () => void;
  onSave: (data: { pet_id: string; type: string; title: string; date: string; notes: string; next_due: string }) => void;
  petId: string;
}

const careTypes = ['Vacina', 'Vermifugação', 'Consulta', 'Medicamento', 'Outro'];

export function CareRecordForm({ onClose, onSave, petId }: CareRecordFormProps) {
  const [type, setType] = useState('Vacina');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [nextDue, setNextDue] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!title.trim()) { setError('O título é obrigatório'); return; }
    onSave({ pet_id: petId, type, title: title.trim(), date, notes, next_due: nextDue });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-5 animate-slide-up max-h-[88vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl text-primary-900">Registrar cuidado</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100"><X size={18} className="text-gray-600" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo</label>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {careTypes.map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${type === t ? 'bg-accent-500 text-primary-900' : 'bg-secondary-100 text-gray-600'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div><label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Vacina V10 - 1ª dose" className="field mt-1" />
            {error && <p className="text-xs text-error-500 mt-1">{error}</p>}</div>
          <div><label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field mt-1" /></div>
          <div><label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Lote, veterinário, reações..." rows={2} className="field mt-1 resize-none" /></div>
          <div><label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Próxima aplicação (opcional)</label>
            <input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} className="field mt-1" /></div>
          <button onClick={submit} className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm">Adicionar à carteirinha</button>
        </div>
      </div>
    </div>
  );
}

interface TaskFormProps {
  onClose: () => void;
  onSave: (data: { pet_id: string; title: string; description: string; category: string; due_at: string }) => void;
  petId: string;
}

const categories = [
  { value: 'saude', label: 'Saúde', color: 'bg-error-100 text-error-700' },
  { value: 'alimentacao', label: 'Alimentação', color: 'bg-accent-100 text-accent-700' },
  { value: 'higiene', label: 'Higiene', color: 'bg-primary-100 text-primary-700' },
  { value: 'passeio', label: 'Passeio', color: 'bg-success-100 text-success-700' },
  { value: 'outro', label: 'Outro', color: 'bg-secondary-100 text-secondary-700' },
];

export function TaskForm({ onClose, onSave, petId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('saude');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [error, setError] = useState('');

  const submit = () => {
    if (!title.trim()) { setError('O título é obrigatório'); return; }
    onSave({ pet_id: petId, title: title.trim(), description: description, category, due_at: new Date(`${date}T${time}`).toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-5 animate-slide-up max-h-[88vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl text-primary-900">Novo lembrete</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100"><X size={18} className="text-gray-600" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Dar remédio de vermes" className="field mt-1" />
            {error && <p className="text-xs text-error-500 mt-1">{error}</p>}</div>
          <div><label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Descrição (opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do cuidado..." rows={2} className="field mt-1 resize-none" /></div>
          <div><label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Categoria</label>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {categories.map((c) => (
                <button key={c.value} onClick={() => setCategory(c.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${category === c.value ? c.color + ' ring-2 ring-offset-1' : 'bg-secondary-100 text-gray-500'}`}>{c.label}</button>
              ))}
            </div></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field mt-1" /></div>
            <div><label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Hora</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field mt-1" /></div>
          </div>
          <button onClick={submit} className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm">Criar lembrete</button>
        </div>
      </div>
    </div>
  );
}

export { categories, careTypes };
