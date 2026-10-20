import { useEffect, useState, useCallback } from 'react';
import type { Reminder, RepeatInterval } from '@/types';

const STORAGE_KEY = 'lacoanimal_reminders';

function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Reminder[];
  } catch {
    // ignore
  }
  const now = new Date();
  const today = (h: number, m: number) => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const tomorrow = (h: number, m: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const dayAfter = (h: number, m: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    { id: 'r1', title: '2ª Dose de Vermífugo', petName: 'Bob', datetime: today(18, 0), repeat: 'none', completed: false },
    { id: 'r2', title: 'Consulta de Rotina', petName: 'Mel', datetime: tomorrow(10, 30), repeat: 'none', completed: false },
    { id: 'r3', title: 'Aplicar Remédio de Pulga', petName: 'Thor', datetime: dayAfter(9, 0), repeat: 'monthly', completed: false },
  ];
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = useCallback(
    (title: string, petName: string, datetime: string, repeat: RepeatInterval) => {
      const id = `r${Date.now()}`;
      setReminders((prev) => {
        const updated = [...prev, { id, title, petName, datetime, repeat, completed: false }];
        return updated.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
      });
    },
    [],
  );

  const completeReminder = useCallback((id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed: true } : r)));
  }, []);

  const postponeReminder = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const d = new Date(r.datetime);
        d.setHours(d.getHours() + 1);
        return { ...r, datetime: d.toISOString() };
      }),
    );
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { reminders, addReminder, completeReminder, postponeReminder, deleteReminder };
}
