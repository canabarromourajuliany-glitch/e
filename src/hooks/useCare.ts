import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Pet, CareRecord, CareTask } from '@/types';

const GUEST_KEY = 'laco-animal-guest-care';

interface GuestData {
  pets: Pet[];
  records: CareRecord[];
  tasks: CareTask[];
}

function loadGuest(): GuestData {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (raw) return JSON.parse(raw) as GuestData;
  } catch { /* dados corrompidos: começa vazio */ }
  return { pets: [], records: [], tasks: [] };
}

function newId(): string {
  return crypto.randomUUID();
}

// Modo visitante: os dados ficam salvos apenas neste aparelho, no navegador.
export function useGuestCare(active: boolean) {
  const [guest, setGuest] = useState<GuestData>(loadGuest);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (active) setLoading(false);
  }, [active]);

  useEffect(() => {
    if (active) localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  }, [guest, active]);

  const { pets, records, tasks } = guest;

  const addPet = useCallback(async (data: Omit<Pet, 'id' | 'user_id' | 'created_at'>) => {
    const pet: Pet = { ...data, id: newId(), created_at: new Date().toISOString() };
    setGuest((prev) => ({ ...prev, pets: [...prev.pets, pet] }));
    return true;
  }, []);

  const updatePet = useCallback(async (id: string, data: Partial<Pet>) => {
    setGuest((prev) => ({ ...prev, pets: prev.pets.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
    return true;
  }, []);

  const deletePet = useCallback(async (id: string) => {
    setGuest((prev) => ({
      pets: prev.pets.filter((p) => p.id !== id),
      records: prev.records.filter((r) => r.pet_id !== id),
      tasks: prev.tasks.filter((t) => t.pet_id !== id),
    }));
  }, []);

  const addRecord = useCallback(async (data: Omit<CareRecord, 'id' | 'user_id' | 'created_at'>) => {
    const rec: CareRecord = { ...data, id: newId(), created_at: new Date().toISOString() };
    setGuest((prev) => ({ ...prev, records: [rec, ...prev.records] }));
    return rec;
  }, []);

  const updateRecord = useCallback(async (id: string, data: Partial<Omit<CareRecord, 'id' | 'user_id' | 'created_at' | 'pet_id'>>) => {
    const rec = guest.records.find((r) => r.id === id);
    if (!rec) return null;
    const updated = { ...rec, ...data };
    setGuest((prev) => ({ ...prev, records: prev.records.map((r) => (r.id === id ? updated : r)) }));
    return updated;
  }, [guest.records]);

  const deleteRecord = useCallback(async (id: string) => {
    setGuest((prev) => ({ ...prev, records: prev.records.filter((r) => r.id !== id) }));
  }, []);

  const addTask = useCallback(async (data: Omit<CareTask, 'id' | 'user_id' | 'created_at' | 'completed' | 'completed_at'>) => {
    const task: CareTask = { ...data, id: newId(), completed: false, completed_at: null, created_at: new Date().toISOString() };
    setGuest((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task].sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()),
    }));
    return task;
  }, []);

  const completeTask = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    setGuest((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === id ? { ...t, completed: true, completed_at: now } : t)) }));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setGuest((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
  }, []);

  return { pets, records, tasks, loading, addPet, updatePet, deletePet, addRecord, updateRecord, deleteRecord, addTask, completeTask, deleteTask };
}

function useDbCare(session: Session | null) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [records, setRecords] = useState<CareRecord[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!session?.user) { setPets([]); setRecords([]); setTasks([]); setLoading(false); return; }
    setLoading(true);
    const [p, r, t] = await Promise.all([
      supabase.from('pets').select('*').order('created_at', { ascending: true }),
      supabase.from('care_records').select('*').order('date', { ascending: false }),
      supabase.from('care_tasks').select('*').order('due_at', { ascending: true }),
    ]);
    setPets((p.data as Pet[]) || []);
    setRecords((r.data as CareRecord[]) || []);
    setTasks((t.data as CareTask[]) || []);
    setLoading(false);
  }, [session?.user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const addPet = useCallback(async (data: Omit<Pet, 'id' | 'user_id' | 'created_at'>) => {
    const { data: row, error } = await supabase.from('pets').insert(data).select().single();
    if (error || !row) return false;
    setPets((prev) => [...prev, row as Pet]);
    return true;
  }, []);

  const updatePet = useCallback(async (id: string, data: Partial<Pet>) => {
    const { error } = await supabase.from('pets').update(data).eq('id', id);
    if (error) return false;
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    return true;
  }, []);

  const deletePet = useCallback(async (id: string) => {
    await supabase.from('pets').delete().eq('id', id);
    setPets((prev) => prev.filter((p) => p.id !== id));
    setRecords((prev) => prev.filter((r) => r.pet_id !== id));
    setTasks((prev) => prev.filter((t) => t.pet_id !== id));
  }, []);

  const addRecord = useCallback(async (data: Omit<CareRecord, 'id' | 'user_id' | 'created_at'>) => {
    const { data: row } = await supabase.from('care_records').insert(data).select().single();
    if (row) setRecords((prev) => [row as CareRecord, ...prev]);
    return row as CareRecord | null;
  }, []);

  const updateRecord = useCallback(async (id: string, data: Partial<Omit<CareRecord, 'id' | 'user_id' | 'created_at' | 'pet_id'>>) => {
    const { data: row, error } = await supabase.from('care_records').update(data).eq('id', id).select().single();
    if (error || !row) return null;
    setRecords((prev) => prev.map((r) => (r.id === id ? (row as CareRecord) : r)));
    return row as CareRecord;
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    await supabase.from('care_records').delete().eq('id', id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addTask = useCallback(async (data: Omit<CareTask, 'id' | 'user_id' | 'created_at' | 'completed' | 'completed_at'>) => {
    const { data: row } = await supabase.from('care_tasks').insert({ ...data, completed: false, completed_at: null }).select().single();
    if (row) setTasks((prev) => [...prev, row as CareTask].sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()));
    return row as CareTask | null;
  }, []);

  const completeTask = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    await supabase.from('care_tasks').update({ completed: true, completed_at: now }).eq('id', id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: true, completed_at: now } : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from('care_tasks').delete().eq('id', id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { pets, records, tasks, loading, addPet, updatePet, deletePet, addRecord, updateRecord, deleteRecord, addTask, completeTask, deleteTask, reload: loadAll };
}

// Hook unificador: usa o banco quando há sessão, ou o modo visitante quando não há.
export function useCare(session: Session | null, guestMode: boolean = false) {
  const guestActive = !session?.user && guestMode;
  const guestCare = useGuestCare(guestActive);
  const dbCare = useDbCare(guestActive ? null : session);
  const guestRef = useRef(guestCare);
  guestRef.current = guestCare;

  return guestActive ? guestCare : dbCare;
}
