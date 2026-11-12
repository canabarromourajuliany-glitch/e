import { useState } from 'react';
import { Heart, LogOut, PackagePlus, PawPrint, Plus, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type AccountScreenProps = { user: User; onSignOut: () => void };

export function AccountScreen({ user, onSignOut }: AccountScreenProps) {
  const [section, setSection] = useState<'animal' | 'donation'>('animal');
  const [message, setMessage] = useState('');
  const [animal, setAnimal] = useState({ name: '', species: 'Cão', breed: '', age: '', gender: 'Macho', description: '', photo: '' });
  const [donation, setDonation] = useState({ title: '', category: 'Ração', description: '', city: '', contact: '', type: 'offer' });

  const saveAnimal = async () => {
    const { error } = await supabase.from('adoption_posts').insert({ ...animal });
    setMessage(error ? 'Não foi possível publicar o animal.' : 'Animal publicado na adoção.');
    if (!error) setAnimal({ name: '', species: 'Cão', breed: '', age: '', gender: 'Macho', description: '', photo: '' });
  };

  const saveDonation = async () => {
    const { error } = await supabase.from('donation_posts').insert({ ...donation });
    setMessage(error ? 'Não foi possível publicar a doação.' : 'Doação publicada com sucesso.');
    if (!error) setDonation({ title: '', category: 'Ração', description: '', city: '', contact: '', type: 'offer' });
  };

  return <main className="min-h-screen pb-24">
    <header className="bg-primary-600 border-b-4 border-accent-500 px-5 pt-5 pb-5 text-white"><div className="flex items-center gap-3"><div className="rounded-full bg-accent-500 p-3"><UserRound size={22} /></div><div><p className="text-xs uppercase tracking-widest text-white/70">Minha conta</p><h1 className="font-serif text-2xl">{user.user_metadata.display_name || user.email || 'Visitante'}</h1></div></div></header>
    <div className="px-4 pt-5 space-y-4">
      <div className="grid grid-cols-2 gap-2"><button onClick={() => { setSection('animal'); setMessage(''); }} className={`rounded-xl p-3 text-sm font-bold ${section === 'animal' ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-primary-700'}`}><PawPrint size={18} className="mx-auto mb-1" />Colocar para adoção</button><button onClick={() => { setSection('donation'); setMessage(''); }} className={`rounded-xl p-3 text-sm font-bold ${section === 'donation' ? 'bg-accent-500 text-primary-900' : 'bg-secondary-100 text-primary-700'}`}><PackagePlus size={18} className="mx-auto mb-1" />Publicar doação</button></div>
      <div className="rounded-2xl bg-secondary-100 border border-secondary-200 p-5 space-y-3">
        {section === 'animal' ? <>
          <h2 className="font-serif text-2xl text-primary-900">Encontrar um lar</h2>
          <input value={animal.name} onChange={e => setAnimal({ ...animal, name: e.target.value })} placeholder="Nome do animal" className="field" />
          <div className="grid grid-cols-2 gap-2"><select value={animal.species} onChange={e => setAnimal({ ...animal, species: e.target.value })} className="field"><option>Cão</option><option>Gato</option><option>Outro</option></select><select value={animal.gender} onChange={e => setAnimal({ ...animal, gender: e.target.value })} className="field"><option>Macho</option><option>Fêmea</option></select></div>
          <input value={animal.breed} onChange={e => setAnimal({ ...animal, breed: e.target.value })} placeholder="Raça ou descrição" className="field" /><input value={animal.age} onChange={e => setAnimal({ ...animal, age: e.target.value })} placeholder="Idade" className="field" /><input value={animal.photo} onChange={e => setAnimal({ ...animal, photo: e.target.value })} placeholder="Link da foto (opcional)" className="field" /><textarea value={animal.description} onChange={e => setAnimal({ ...animal, description: e.target.value })} placeholder="Conte um pouco sobre ele" rows={4} className="field resize-none" /><button onClick={saveAnimal} className="w-full rounded-xl bg-primary-600 py-3 font-bold text-white"><Plus size={16} className="inline mr-1" />Publicar animal</button>
        </> : <>
          <h2 className="font-serif text-2xl text-primary-900">Ajudar quem precisa</h2>
          <input value={donation.title} onChange={e => setDonation({ ...donation, title: e.target.value })} placeholder="O que você quer doar ou precisa?" className="field" /><select value={donation.type} onChange={e => setDonation({ ...donation, type: e.target.value })} className="field"><option value="offer">Quero doar</option><option value="request">Preciso de ajuda</option></select><select value={donation.category} onChange={e => setDonation({ ...donation, category: e.target.value })} className="field"><option>Ração</option><option>Medicamentos</option><option>Brinquedos</option><option>Acessórios</option><option>Higiene</option></select><textarea value={donation.description} onChange={e => setDonation({ ...donation, description: e.target.value })} placeholder="Descreva os itens" rows={4} className="field resize-none" /><input value={donation.city} onChange={e => setDonation({ ...donation, city: e.target.value })} placeholder="Cidade" className="field" /><input value={donation.contact} onChange={e => setDonation({ ...donation, contact: e.target.value })} placeholder="Telefone ou contato" className="field" /><button onClick={saveDonation} className="w-full rounded-xl bg-accent-500 py-3 font-bold text-primary-900"><Heart size={16} className="inline mr-1" />Publicar doação</button>
        </>}
        {message && <p className="rounded-xl bg-success-50 p-3 text-sm font-semibold text-success-700">{message}</p>}
      </div>
      <button onClick={onSignOut} className="w-full rounded-xl border border-secondary-300 py-3 text-sm font-bold text-primary-700"><LogOut size={16} className="inline mr-2" />Sair da conta</button>
    </div>
  </main>;
}
