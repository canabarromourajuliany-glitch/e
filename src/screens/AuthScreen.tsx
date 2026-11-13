import { useState } from 'react';
import { ArrowRight, KeyRound, LockKeyhole, Mail, PawPrint } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AuthScreen({ onGuest }: { onGuest?: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendReset = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) setMessage('Não foi possível enviar. Confira seu email e tente novamente.');
    else setMessage('Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada.');
  };

  const submit = async () => {
    setLoading(true);
    setMessage('');
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (result.error) setMessage(result.error.message.includes('already registered') ? 'Este email já está cadastrado.' : 'Não foi possível concluir. Confira os dados e tente novamente.');
    else if (mode === 'signup') setMessage('Cadastro realizado. Você já pode entrar na sua conta.');
  };

  return (
    <main className="min-h-screen bg-secondary-50 px-5 py-12 flex items-center">
      <div className="w-full rounded-3xl bg-secondary-100 border border-secondary-200 p-6 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-5">
          <PawPrint className="text-white" size={28} />
        </div>
        <p className="text-xs uppercase tracking-[0.22em] text-accent-700 font-bold">Laço Animal</p>
        <h1 className="font-serif text-3xl text-primary-900 mt-2">{mode === 'forgot' ? 'Recuperar senha' : 'Cuide, ajude e conecte.'}</h1>
        <p className="text-sm text-gray-600 mt-2 mb-6">{mode === 'forgot' ? 'Informe seu email e enviaremos um link para você criar uma nova senha.' : 'Crie sua conta para publicar animais, oferecer doações e acompanhar suas contribuições.'}</p>
        <div className="space-y-3">
          {mode === 'forgot' ? <p className="text-xs text-gray-600"><KeyRound size={14} className="inline mr-1" />Cheque também a pasta de spam.</p> : mode === 'signup' && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="w-full rounded-xl border border-secondary-300 bg-white px-4 py-3 text-sm outline-none focus:border-accent-500" />}
          <label className="flex items-center gap-2 rounded-xl border border-secondary-300 bg-white px-4"><Mail size={16} className="text-primary-500" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu email" className="w-full py-3 text-sm outline-none" /></label>
          {mode !== 'forgot' && <label className="flex items-center gap-2 rounded-xl border border-secondary-300 bg-white px-4"><LockKeyhole size={16} className="text-primary-500" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full py-3 text-sm outline-none" /></label>}
          {message && <p className="text-sm text-primary-700">{message}</p>}
          <button onClick={mode === 'forgot' ? sendReset : submit} disabled={loading} className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60">{loading ? 'Aguarde...' : mode === 'forgot' ? 'Enviar link' : mode === 'signup' ? 'Criar cadastro' : 'Entrar'} <ArrowRight size={16} className="inline ml-1" /></button>
        </div>
        {mode === 'signin' && <button onClick={() => { setMode('forgot'); setMessage(''); }} className="w-full mt-3 text-sm text-primary-700 underline">Esqueci minha senha</button>}
        <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }} className="w-full mt-4 text-sm font-semibold text-accent-700">{mode === 'signin' ? 'Ainda não tenho cadastro' : 'Já tenho cadastro'}</button>
        {mode === 'forgot' && <button onClick={() => { setMode('signin'); setMessage(''); }} className="w-full mt-3 text-sm text-gray-600 underline">Voltar para o login</button>}
        {onGuest && <button onClick={onGuest} className="w-full mt-3 rounded-xl border border-secondary-300 bg-white py-3 text-sm font-semibold text-primary-700">Entrar sem cadastro</button>}
      </div>
    </main>
  );
}
