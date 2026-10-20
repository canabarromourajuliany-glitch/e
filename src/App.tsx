import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { AdoptionScreen } from '@/screens/AdoptionScreen';
import { DonationsScreen } from '@/screens/DonationsScreen';
import { ReportsScreen } from '@/screens/ReportsScreen';
import { RemindersScreen } from '@/screens/RemindersScreen';
import { ClinicsScreen } from '@/screens/ClinicsScreen';
import { useReminders } from '@/hooks/useReminders';
import type { TabId } from '@/types';

function App() {
  const [tab, setTab] = useState<TabId>('adoption');
  const reminderHook = useReminders();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {tab === 'adoption' && <AdoptionScreen />}
      {tab === 'donations' && <DonationsScreen />}
      {tab === 'reports' && <ReportsScreen />}
      {tab === 'reminders' && (
        <RemindersScreen
          reminders={reminderHook.reminders}
          onAdd={reminderHook.addReminder}
          onComplete={reminderHook.completeReminder}
          onPostpone={reminderHook.postponeReminder}
          onDelete={reminderHook.deleteReminder}
        />
      )}
      {tab === 'clinics' && <ClinicsScreen />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default App;
