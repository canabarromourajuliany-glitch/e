import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { BottomNav } from '@/components/BottomNav';
import { AdoptionScreen } from '@/screens/AdoptionScreen';
import { DonationsScreen } from '@/screens/DonationsScreen';
import { ReportsScreen } from '@/screens/ReportsScreen';
import { CareScreen } from '@/screens/CareScreen';
import { ClinicsScreen } from '@/screens/ClinicsScreen';
import { WildlifeScreen } from '@/screens/WildlifeScreen';
import { AuthScreen } from '@/screens/AuthScreen';
import { AccountScreen } from '@/screens/AccountScreen';
import { useCare } from '@/hooks/useCare';
import { supabase } from '@/lib/supabase';
import type { TabId } from '@/types';

function App() {
  const [tab, setTab] = useState<TabId>('adoption');
  const [session, setSession] = useState<Session | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const care = useCare(session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setGuestMode(false);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-secondary-50 flex items-center justify-center text-primary-700">Carregando...</div>;
  if (!session?.user && !guestMode) return <div className="max-w-md mx-auto"><AuthScreen onGuest={() => setGuestMode(true)} /></div>;

  return <div className="max-w-md mx-auto bg-secondary-50 min-h-screen relative">
    {tab === 'adoption' && <AdoptionScreen />}
    {tab === 'donations' && <DonationsScreen />}
    {tab === 'reports' && <ReportsScreen />}
    {tab === 'care' && (
      <CareScreen
        session={session}
        pets={care.pets}
        records={care.records}
        tasks={care.tasks}
        loading={care.loading}
        onAddPet={care.addPet}
        onUpdatePet={care.updatePet}
        onDeletePet={care.deletePet}
        onAddRecord={care.addRecord}
        onUpdateRecord={care.updateRecord}
        onDeleteRecord={care.deleteRecord}
        onAddTask={care.addTask}
        onCompleteTask={care.completeTask}
        onDeleteTask={care.deleteTask}
      />
    )}
    {tab === 'clinics' && <ClinicsScreen />}
    {tab === 'wildlife' && <WildlifeScreen />}
    {tab === 'account' && session?.user && <AccountScreen user={session.user} onSignOut={() => supabase.auth.signOut()} />}
    {tab === 'account' && !session?.user && <AuthScreen />}
    <BottomNav active={tab} onChange={setTab} />
  </div>;
}

export default App;
