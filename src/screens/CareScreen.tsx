import { useState } from 'react';
import {
  PawPrint, Plus, ChevronLeft, Syringe, Stethoscope, Pill, ShieldCheck,
  Clock, CheckCircle2, Calendar, Trash2, X, Heart, Bell, ChevronRight,
  Dog, Cat, Bird, Rabbit, Fish, FileText, AlertCircle, Pencil, Bot
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import type { Pet, CareRecord, CareTask } from '@/types';
import { AppHeader } from '@/components/AppHeader';
import { PetForm, CareRecordForm, TaskForm } from './CareForms';
import { VaccineBooklet } from './VaccineBooklet';
import { AiChat } from './AiChat';
import { formatDay, daysFromToday } from '@/lib/dates';
import { supabase } from '@/lib/supabase';

interface CareScreenProps {
  session: Session | null;
  guestMode: boolean;
  pets: Pet[];
  records: CareRecord[];
  tasks: CareTask[];
  loading: boolean;
  onAddPet: (data: Omit<Pet, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  onUpdatePet: (id: string, data: Partial<Pet>) => Promise<boolean>;
  onDeletePet: (id: string) => Promise<void>;
  onAddRecord: (data: Omit<CareRecord, 'id' | 'user_id' | 'created_at'>) => Promise<CareRecord | null>;
  onUpdateRecord: (id: string, data: Partial<Omit<CareRecord, 'id' | 'user_id' | 'created_at' | 'pet_id'>>) => Promise<CareRecord | null>;
  onDeleteRecord: (id: string) => Promise<void>;
  onAddTask: (data: Omit<CareTask, 'id' | 'user_id' | 'created_at' | 'completed' | 'completed_at'>) => Promise<CareTask | null>;
  onCompleteTask: (id: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const speciesIcon: Record<string, typeof Dog> = { 'Cão': Dog, 'Gato': Cat, 'Pássaro': Bird, 'Coelho': Rabbit, 'Peixe': Fish, 'Outro': PawPrint };

const recordTypeIcon: Record<string, typeof Syringe> = {
  'Vacina': Syringe, 'Vermifugação': ShieldCheck, 'Consulta': Stethoscope, 'Medicamento': Pill, 'Outro': FileText
};

const categoryInfo: Record<string, { label: string; color: string; icon: typeof Heart }> = {
  'saude': { label: 'Saúde', color: 'bg-error-100 text-error-700', icon: Heart },
  'alimentacao': { label: 'Alimentação', color: 'bg-accent-100 text-accent-700', icon: Pill },
  'higiene': { label: 'Higiene', color: 'bg-primary-100 text-primary-700', icon: ShieldCheck },
  'passeio': { label: 'Passeio', color: 'bg-success-100 text-success-700', icon: PawPrint },
  'outro': { label: 'Outro', color: 'bg-secondary-100 text-secondary-700', icon: Bell },
};

function relativeDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff === -1) return 'Ontem';
  if (diff < 0) return `Há ${Math.abs(diff)} dias`;
  if (diff <= 7) return `Em ${diff} dias`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function taskStatus(task: CareTask): 'overdue' | 'today' | 'soon' | 'future' {
  const now = new Date();
  const due = new Date(task.due_at);
  const diff = Math.floor((due.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 3) return 'soon';
  return 'future';
}

const statusConfig = {
  overdue: { label: 'Atrasado', color: 'bg-error-500', text: 'text-error-700', bg: 'bg-error-50' },
  today: { label: 'Para hoje', color: 'bg-accent-500', text: 'text-accent-700', bg: 'bg-accent-50' },
  soon: { label: 'Próximo', color: 'bg-primary-400', text: 'text-primary-700', bg: 'bg-primary-50' },
  future: { label: 'Agendado', color: 'bg-success-400', text: 'text-success-700', bg: 'bg-success-50' },
};

export function CareScreen(props: CareScreenProps) {
  const { session, guestMode, pets, records, tasks, loading, onAddPet, onUpdatePet, onDeletePet, onAddRecord, onUpdateRecord, onDeleteRecord, onAddTask, onCompleteTask, onDeleteTask } = props;
  const [view, setView] = useState<'dashboard' | 'petDetail'>('dashboard');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [petTab, setPetTab] = useState<'care' | 'reminders' | 'history'>('care');
  const [showPetForm, setShowPetForm] = useState(false);
  const [editPet, setEditPet] = useState<Pet | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const [showChat, setShowChat] = useState(false);

  const startVisitorSession = async () => {
    setStarting(true);
    setStartError('');
    const { error } = await supabase.auth.signInAnonymously();
    setStarting(false);
    if (!error) return;
    setStartError(
      error.code === 'anonymous_provider_disabled'
        ? 'O acesso sem cadastro ainda não está ativado no servidor. Crie uma conta na aba Conta enquanto isso.'
        : 'Não foi possível abrir o acesso agora. Tente novamente em instantes.',
    );
  };

  const openPetDetail = (pet: Pet) => { setSelectedPet(pet); setView('petDetail'); setPetTab('care'); };
  const backToDashboard = () => { setView('dashboard'); setSelectedPet(null); };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const overdueTasks = pendingTasks.filter((t) => taskStatus(t) === 'overdue');
  const todayTasks = pendingTasks.filter((t) => taskStatus(t) === 'today');
  const soonTasks = pendingTasks.filter((t) => taskStatus(t) === 'soon' || taskStatus(t) === 'future');
  const completedTasks = tasks.filter((t) => t.completed);
  const petRecords = selectedPet ? records.filter((r) => r.pet_id === selectedPet.id) : [];
  const petOtherRecords = petRecords.filter((r) => r.type !== 'Vacina');
  const upcomingVaccines = records
    .filter((r) => r.type === 'Vacina' && r.next_due)
    .sort((a, b) => a.next_due.localeCompare(b.next_due))
    .slice(0, 4);
  const petTasks = selectedPet ? tasks.filter((t) => t.pet_id === selectedPet.id) : [];

  if (!session?.user && !guestMode) {
    return (
      <div className="min-h-screen pb-24">
        <AppHeader title="Cuidado em Dia" subtitle="Saúde e bem-estar do seu pet" />
        <div className="px-4 pt-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4"><PawPrint className="text-primary-500" size={32} /></div>
          <h2 className="font-serif text-2xl text-primary-900 mb-2">Comece agora</h2>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">Abra um acesso privado para cadastrar animais, registrar vacinas e acompanhar os cuidados, sem formulário de cadastro.</p>
          <button onClick={startVisitorSession} disabled={starting} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60">
            {starting ? 'Abrindo...' : 'Abrir meu acesso'}
          </button>
          <button onClick={() => setGuestMode(true)} className="mt-3 block w-full max-w-xs mx-auto rounded-xl border border-secondary-300 bg-white py-3 text-sm font-semibold text-primary-700 hover:border-primary-300 transition-colors">
            Usar sem acesso (dados ficam neste aparelho)
          </button>
          {startError && <p className="mt-3 text-sm text-error-600">{startError}</p>}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-secondary-50 flex items-center justify-center text-primary-700">Carregando cuidados...</div>;
  }

  // ===== DASHBOARD =====
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen pb-24">
        <AppHeader title="Cuidado em Dia" subtitle="Saúde e bem-estar do seu pet" />

        <div className="px-4 pt-5 space-y-5">
          {/* Greeting */}
          <div className="rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-5 text-white shadow-md">
            <p className="text-xs uppercase tracking-widest text-white/70">Bem-vindo(a)</p>
            <h2 className="font-serif text-2xl mt-1">Tudo em ordem por aqui?</h2>
            <p className="text-sm text-white/85 mt-2 leading-relaxed">
              {pets.length === 0 ? 'Cadastre seu primeiro animal para começar a acompanhar a rotina de cuidados.'
                : `Você tem ${pets.length} ${pets.length === 1 ? 'animal' : 'animais'} e ${pendingTasks.length} ${pendingTasks.length === 1 ? 'lembrete' : 'lembretes'} ativos.`}
            </p>
            {guestMode && !session?.user && (
              <p className="mt-2 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] leading-snug text-white/90">
                Modo sem acesso: seus dados ficam salvos apenas neste aparelho.
              </p>
            )}
          </div>

          {/* Alert banner */}
          {overdueTasks.length > 0 && (
            <div className="rounded-2xl bg-error-50 border border-error-200 p-4 flex items-start gap-3">
              <AlertCircle className="text-error-600 mt-0.5 shrink-0" size={20} />
              <div>
                <h3 className="font-bold text-error-800 text-sm">{overdueTasks.length} cuidado(s) atrasado(s)</h3>
                <p className="text-xs text-error-600 mt-0.5">Verifique os lembretes pendentes e mantenha a saúde em dia.</p>
              </div>
            </div>
          )}

          {/* Pets section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl text-primary-900">Meus animais</h2>
              <button onClick={() => { setEditPet(null); setShowPetForm(true); }} className="flex items-center gap-1 text-sm font-bold text-accent-700"><Plus size={16} />Adicionar</button>
            </div>
            {pets.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-secondary-300 p-8 text-center">
                <PawPrint className="mx-auto text-gray-300 mb-2" size={36} />
                <p className="text-sm text-gray-500">Cadastre seu animal para começar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pets.map((pet) => {
                  const Icon = speciesIcon[pet.species] || PawPrint;
                  const petPending = tasks.filter((t) => t.pet_id === pet.id && !t.completed).length;
                  return (
                    <button key={pet.id} onClick={() => openPetDetail(pet)} className="w-full flex items-center gap-3 rounded-2xl bg-secondary-100 border border-secondary-200 p-3.5 text-left hover:shadow-md transition-shadow">
                      <div className="h-14 w-14 rounded-xl bg-secondary-200 overflow-hidden flex items-center justify-center shrink-0">
                        {pet.photo ? <img src={pet.photo} alt={pet.name} className="h-full w-full object-cover" /> : <Icon className="text-primary-500" size={26} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-primary-900 truncate">{pet.name}</h3>
                        <p className="text-xs text-gray-500">{pet.species}{pet.birthdate ? ` · ${pet.birthdate}` : ''}</p>
                        {petPending > 0 && <span className="inline-block mt-1 text-[11px] font-bold text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full">{petPending} pendente(s)</span>}
                      </div>
                      <ChevronRight className="text-gray-400 shrink-0" size={20} />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {upcomingVaccines.length > 0 && (
            <section>
              <h2 className="font-serif text-xl text-primary-900 mb-3">Próximas vacinas</h2>
              <div className="space-y-2">
                {upcomingVaccines.map((rec) => {
                  const pet = pets.find((p) => p.id === rec.pet_id);
                  const days = daysFromToday(rec.next_due);
                  const late = days < 0;
                  return (
                    <button key={rec.id} onClick={() => { if (pet) { openPetDetail(pet); setPetTab('care'); } }}
                      className="w-full flex items-center gap-3 rounded-2xl bg-white border border-secondary-200 p-3.5 text-left hover:shadow-sm transition-shadow">
                      <div className="p-2 rounded-xl bg-accent-100 text-accent-700"><Syringe size={16} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-primary-900 truncate">{rec.title}</p>
                        <p className="text-xs text-gray-500">{pet?.name || '—'} · {formatDay(rec.next_due)}</p>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${late ? 'bg-error-50 text-error-700' : 'bg-primary-50 text-primary-700'}`}>{late ? 'Atrasada' : days === 0 ? 'Hoje' : `Em ${days} dia(s)`}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Upcoming tasks summary */}
          {pendingTasks.length > 0 && (
            <section>
              <h2 className="font-serif text-xl text-primary-900 mb-3">Próximos cuidados</h2>
              <div className="space-y-2">
                {[...overdueTasks, ...todayTasks, ...soonTasks].slice(0, 5).map((task) => {
                  const pet = pets.find((p) => p.id === task.pet_id);
                  const status = taskStatus(task);
                  const sc = statusConfig[status];
                  const ci = categoryInfo[task.category] || categoryInfo['outro'];
                  const CIcon = ci.icon;
                  return (
                    <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-white border border-secondary-200 p-3.5">
                      <div className={`p-2 rounded-xl ${ci.color}`}><CIcon size={16} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-primary-900 truncate">{task.title}</p>
                        <p className="text-xs text-gray-500">{pet?.name || '—'} · {relativeDate(task.due_at)}</p>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Quick stats */}
          {pets.length > 0 && (
            <section className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-secondary-100 border border-secondary-200 p-3 text-center">
                <p className="text-2xl font-serif text-primary-700">{pets.length}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Animais</p>
              </div>
              <div className="rounded-2xl bg-secondary-100 border border-secondary-200 p-3 text-center">
                <p className="text-2xl font-serif text-accent-700">{pendingTasks.length}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Pendentes</p>
              </div>
              <div className="rounded-2xl bg-secondary-100 border border-secondary-200 p-3 text-center">
                <p className="text-2xl font-serif text-success-700">{completedTasks.length}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Concluídos</p>
              </div>
            </section>
          )}
        </div>

        {showPetForm && <PetForm onClose={() => setShowPetForm(false)} onSave={onAddPet} pet={editPet} />}
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-accent-500 pl-4 pr-5 py-3.5 font-bold text-primary-900 shadow-lg shadow-accent-300 hover:bg-accent-400 transition-colors active:scale-95"
        >
          <Bot size={20} />
          <span className="text-sm">Tirar dúvidas</span>
        </button>
        {showChat && <AiChat onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  // ===== PET DETAIL =====
  const pet = selectedPet;
  if (!pet) { backToDashboard(); return null; }
  const Icon = speciesIcon[pet.species] || PawPrint;
  const petPendingTasks = petTasks.filter((t) => !t.completed);
  const petCompletedTasks = petTasks.filter((t) => t.completed);
  const petOverdueTasks = petPendingTasks.filter((t) => taskStatus(t) === 'overdue');
  const petTodayTasks = petPendingTasks.filter((t) => taskStatus(t) === 'today');
  const petSoonTasks = petPendingTasks.filter((t) => taskStatus(t) === 'soon');
  const petFutureTasks = petPendingTasks.filter((t) => taskStatus(t) === 'future');

  const sortedPending = [...petOverdueTasks, ...petTodayTasks, ...petSoonTasks, ...petFutureTasks];
  const sortedHistory = [...petCompletedTasks].sort((a, b) => new Date(b.completed_at || b.due_at).getTime() - new Date(a.completed_at || a.due_at).getTime());

  return (
    <div className="min-h-screen pb-24">
      {/* Pet header */}
      <header className="bg-primary-600 border-b-4 border-accent-500 px-5 pt-5 pb-5 text-white">
        <div className="flex items-center gap-3">
          <button onClick={backToDashboard} className="p-2 rounded-full bg-white/15"><ChevronLeft size={20} /></button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{pet.name}</h1>
            <p className="text-sm text-white/85">{pet.species}{pet.birthdate ? ` · nasc. ${pet.birthdate}` : ''}</p>
          </div>
          <button onClick={() => { setEditPet(pet); setShowPetForm(true); }} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/25"><Pencil size={14} />Editar</button>
        </div>
      </header>

      {/* Pet photo / avatar banner */}
      <div className="h-32 bg-secondary-200 relative">
        {pet.photo ? <img src={pet.photo} alt={pet.name} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center bg-primary-100"><Icon className="text-primary-400" size={48} /></div>}
      </div>

      {pet.notes && (
        <div className="px-4 pt-3">
          <div className="rounded-xl bg-secondary-100 border border-secondary-200 p-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Observações</p>
            <p className="text-sm text-primary-800">{pet.notes}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex bg-secondary-200 rounded-xl p-1">
          {([['care', 'Carteirinha'], ['reminders', 'Lembretes'], ['history', 'Histórico']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setPetTab(key)}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${petTab === key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 pt-4 space-y-4">
        {/* CARTEIRINHA */}
        {petTab === 'care' && (
          <>
            <VaccineBooklet
              pet={pet}
              records={petRecords}
              onAdd={(values) => onAddRecord({ pet_id: pet.id, type: 'Vacina', ...values })}
              onUpdate={(id, values) => onUpdateRecord(id, values)}
              onDelete={onDeleteRecord}
            />

            <div className="flex items-center justify-between pt-2">
              <h2 className="font-serif text-xl text-primary-900">Outros registros de saúde</h2>
              <button onClick={() => setShowRecordForm(true)} className="flex items-center gap-1 text-sm font-bold text-accent-700"><Plus size={16} />Registrar</button>
            </div>
            {petOtherRecords.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-secondary-300 p-6 text-center">
                <Stethoscope className="mx-auto text-gray-300 mb-2" size={28} />
                <p className="text-sm text-gray-500">Consultas, vermífugos e medicamentos aparecem aqui.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {petOtherRecords.map((rec) => {
                  const RIcon = recordTypeIcon[rec.type] || FileText;
                  return (
                    <div key={rec.id} className="rounded-2xl bg-white border border-secondary-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600"><RIcon size={18} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">{rec.type}</span>
                              <h3 className="font-bold text-primary-900 text-sm">{rec.title}</h3>
                            </div>
                            <button onClick={() => onDeleteRecord(rec.id)} className="p-1 rounded-lg hover:bg-gray-100"><Trash2 size={14} className="text-gray-300" /></button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar size={12} />{formatDay(rec.date)}</p>
                          {rec.notes && <p className="text-sm text-gray-600 mt-2">{rec.notes}</p>}
                          {rec.next_due && (
                            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-700 bg-accent-50 px-2.5 py-1 rounded-lg">
                              <Clock size={12} />Próxima: {formatDay(rec.next_due)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* LEMBRETES */}
        {petTab === 'reminders' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-primary-900">Cuidados pendentes</h2>
              <button onClick={() => setShowTaskForm(true)} className="flex items-center gap-1 text-sm font-bold text-accent-700"><Plus size={16} />Novo</button>
            </div>

            {sortedPending.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-secondary-300 p-8 text-center">
                <CheckCircle2 className="mx-auto text-success-400 mb-2" size={32} />
                <p className="text-sm text-gray-500">Nenhum cuidado pendente. Tudo em dia!</p>
              </div>
            )}

            {petOverdueTasks.length > 0 && (
              <div className="rounded-2xl bg-error-50 border border-error-200 p-3.5 flex items-start gap-3">
                <AlertCircle className="text-error-600 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-error-700">{petOverdueTasks.length} cuidado(s) atrasado(s). Regularize o quanto antes para garantir a saúde do seu animal.</p>
              </div>
            )}

            <div className="space-y-2.5">
              {sortedPending.map((task) => {
                const status = taskStatus(task);
                const sc = statusConfig[status];
                const ci = categoryInfo[task.category] || categoryInfo['outro'];
                const CIcon = ci.icon;
                return (
                  <div key={task.id} className="rounded-2xl bg-white border border-secondary-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${ci.color}`}><CIcon size={18} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-primary-900 text-sm">{task.title}</h3>
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${sc.bg} ${sc.text} shrink-0`}>{sc.label}</span>
                        </div>
                        {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(task.due_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {relativeDate(task.due_at)}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => onCompleteTask(task.id)} className="flex-1 py-2 rounded-lg bg-success-500 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-success-600 transition-colors">
                            <CheckCircle2 size={15} />Marcar como concluído
                          </button>
                          <button onClick={() => onDeleteTask(task.id)} className="py-2 px-3 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* HISTÓRICO */}
        {petTab === 'history' && (
          <>
            <h2 className="font-serif text-xl text-primary-900">Linha do tempo de cuidados</h2>

            {sortedHistory.length === 0 && petRecords.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-secondary-300 p-8 text-center">
                <Clock className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-sm text-gray-500">Nenhum cuidado registrado ainda.</p>
              </div>
            ) : (
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-secondary-300" />

                {/* Care records as history */}
                {petRecords.map((rec) => {
                  const RIcon = recordTypeIcon[rec.type] || FileText;
                  return (
                    <div key={rec.id} className="relative mb-4">
                      <div className="absolute -left-[18px] top-1 w-4 h-4 rounded-full bg-accent-500 border-2 border-white shadow-sm" />
                      <div className="rounded-2xl bg-secondary-100 border border-secondary-200 p-3.5">
                        <div className="flex items-center gap-2 mb-1">
                          <RIcon size={15} className="text-primary-600" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">{rec.type}</span>
                        </div>
                        <h3 className="font-bold text-primary-900 text-sm">{rec.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{formatDay(rec.date)}</p>
                        {rec.notes && <p className="text-sm text-gray-600 mt-1.5">{rec.notes}</p>}
                      </div>
                    </div>
                  );
                })}

                {/* Completed tasks */}
                {sortedHistory.map((task) => {
                  const ci = categoryInfo[task.category] || categoryInfo['outro'];
                  const CIcon = ci.icon;
                  return (
                    <div key={task.id} className="relative mb-4">
                      <div className="absolute -left-[18px] top-1 w-4 h-4 rounded-full bg-success-500 border-2 border-white shadow-sm" />
                      <div className="rounded-2xl bg-success-50 border border-success-200 p-3.5">
                        <div className="flex items-center gap-2 mb-1">
                          <CIcon size={15} className="text-success-600" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-success-700">{ci.label}</span>
                          <CheckCircle2 size={13} className="text-success-500 ml-auto" />
                        </div>
                        <h3 className="font-bold text-primary-900 text-sm">{task.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Concluído em {task.completed_at ? new Date(task.completed_at).toLocaleDateString('pt-BR') : '—'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete pet button */}
      <div className="px-4 pt-6">
        <button onClick={() => { if (confirm(`Remover ${pet.name}? Todos os cuidados e lembretes serão apagados.`)) { onDeletePet(pet.id); backToDashboard(); } }}
          className="w-full rounded-xl border border-error-200 py-3 text-sm font-bold text-error-600 flex items-center justify-center gap-2">
          <Trash2 size={16} />Remover animal
        </button>
      </div>

      {/* Modals */}
      {showPetForm && <PetForm onClose={() => { setShowPetForm(false); setEditPet(null); }} onSave={editPet ? async (data) => { const saved = await onUpdatePet(pet.id, data); if (saved) setSelectedPet({ ...pet, ...data }); return saved; } : onAddPet} pet={editPet} />}
      {showRecordForm && <CareRecordForm onClose={() => setShowRecordForm(false)} onSave={onAddRecord} petId={pet.id} />}
      {showTaskForm && <TaskForm onClose={() => setShowTaskForm(false)} onSave={onAddTask} petId={pet.id} />}
    </div>
  );
}
