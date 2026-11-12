import { AlertTriangle, Bird, CheckCircle2, CircleAlert, Phone, ShieldCheck } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

const animals = [
  { name: 'Tucano', description: 'Ave de bico grande encontrada em áreas de mata e arborizadas.', tone: 'bg-accent-100', photo: 'https://images.pexels.com/photos/31085629/pexels-photo-31085629.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Capivara', description: 'Mamífero que vive perto de rios, lagos e áreas alagadas.', tone: 'bg-secondary-200', photo: 'https://images.pexels.com/photos/21348644/pexels-photo-21348644.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Tamanduá-bandeira', description: 'Animal de hábitos terrestres que precisa de distância e silêncio.', tone: 'bg-primary-100', photo: 'https://images.pexels.com/photos/39962371/pexels-photo-39962371.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Ouriço-cacheiro', description: 'Pequeno mamífero noturno que pode aparecer em áreas urbanas.', tone: 'bg-accent-100', photo: 'https://images.pexels.com/photos/18447656/pexels-photo-18447656.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
];

const procedures = [
  { icon: CircleAlert, title: 'Fique longe', text: 'Não toque, não tente capturar e mantenha crianças e animais domésticos afastados.' },
  { icon: ShieldCheck, title: 'Mantenha a calma', text: 'Evite barulho, flashes e movimentos bruscos. Dê espaço para o animal seguir seu caminho.' },
  { icon: Phone, title: 'Chame ajuda', text: 'Ligue para o IBAMA, para a Polícia Ambiental ou para o órgão ambiental da sua cidade.' },
  { icon: CheckCircle2, title: 'Não ofereça comida', text: 'Alimentos e água podem fazer mal ou colocar você e o animal em risco.' },
];

export function WildlifeScreen() {
  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Animais Silvestres" subtitle="Informação para proteger a fauna" />
      <div className="px-4 pt-5 space-y-5">
        <section className="rounded-3xl bg-primary-600 p-5 text-white shadow-sm">
          <div className="flex items-start gap-3"><div className="rounded-2xl bg-accent-500 p-3 text-primary-900"><Bird size={24} /></div><div><p className="text-xs uppercase tracking-[0.18em] text-white/70">Encontrou um animal?</p><h2 className="font-serif text-2xl mt-1">Proteja sem se aproximar</h2></div></div>
          <p className="mt-4 text-sm leading-relaxed text-white/85">Animais silvestres podem estar assustados, feridos ou apenas de passagem. A melhor ajuda é observar de longe e chamar profissionais.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-primary-900 mb-3">O que fazer</h2>
          <div className="space-y-2">{procedures.map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3 rounded-2xl border border-secondary-200 bg-secondary-100 p-4"><div className="mt-0.5 rounded-xl bg-white p-2 text-accent-600"><Icon size={19} /></div><div><h3 className="font-bold text-primary-900">{title}</h3><p className="mt-1 text-sm leading-relaxed text-gray-600">{text}</p></div></div>)}</div>
        </section>

        <section className="rounded-2xl border border-accent-200 bg-accent-50 p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-accent-700" size={21} /><div><h2 className="font-bold text-primary-900">Linha Verde do IBAMA</h2><p className="mt-1 text-sm leading-relaxed text-gray-700">Use para denúncias, orientações e informações sobre animais silvestres, tráfico e crimes ambientais.</p><a href="tel:08000618080" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white"><Phone size={16} />0800 061 8080</a><p className="mt-2 text-xs text-gray-600">Ligação gratuita. O IBAMA orienta e encaminha cada caso aos órgãos responsáveis.</p></div></div></section>

        <section><h2 className="font-serif text-2xl text-primary-900 mb-3">Exemplos de animais silvestres</h2><div className="grid grid-cols-2 gap-3">{animals.map((animal) => <article key={animal.name} className={`${animal.tone} rounded-2xl overflow-hidden`}><div className="h-32 w-full overflow-hidden"><img src={animal.photo} alt={animal.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" /></div><div className="p-3"><h3 className="font-serif text-lg text-primary-900">{animal.name}</h3><p className="mt-1 text-xs leading-relaxed text-primary-800/75">{animal.description}</p></div></article>)}</div></section>

        <div className="rounded-2xl bg-secondary-100 border border-secondary-200 p-4 text-sm leading-relaxed text-primary-800"><strong>Importante:</strong> se o animal estiver ferido, preso ou oferecendo risco, não tente resolver sozinho. Afaste as pessoas, observe o local com segurança e informe a situação ao atendimento.</div>
      </div>
    </div>
  );
}
