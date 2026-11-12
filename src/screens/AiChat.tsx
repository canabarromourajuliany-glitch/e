import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, Loader2, MessageCircleHeart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Qual a vacina essencial para um filhote?',
  'Meu gato pode comer comida caseira?',
  'Encontrei um gambá no quintal, o que faço?',
  'Com que frequência devo dar banho no cachorro?',
];

export function AiChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o assistente de cuidados com animais. Pode me perguntar sobre saúde, alimentação, vacinas ou o que fazer ao encontrar um animal silvestre no bairro.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || sending) return;
    setError(null);
    setInput('');
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pet-ai-chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();
      if (typeof data?.reply !== 'string' || !data.reply) {
        throw new Error('unexpected');
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setError('Não consegui responder agora. Verifique sua conexão e tente de novo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end" onClick={onClose}>
      <div
        className="bg-secondary-50 w-full h-[85vh] rounded-t-3xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary-600 rounded-t-3xl px-5 py-4 flex items-center gap-3 text-white shrink-0">
          <div className="p-2.5 rounded-xl bg-white/15"><Bot size={22} /></div>
          <div className="flex-1">
            <h2 className="font-bold">Tirar Dúvidas</h2>
            <p className="text-xs text-white/75">Assistente de cuidados com animais</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/15"><X size={18} /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white text-primary-900 border border-secondary-200 rounded-bl-md shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-secondary-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <Loader2 size={18} className="animate-spin text-primary-500" />
              </div>
            </div>
          )}

          {messages.length === 1 && !sending && (
            <div className="grid grid-cols-1 gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm text-primary-700 bg-white border border-secondary-200 rounded-xl px-3.5 py-2.5 hover:border-primary-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-error-50 border border-error-200 px-3.5 py-2.5 text-xs text-error-700">{error}</div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-secondary-200 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida sobre o seu animal..."
              className="flex-1 rounded-xl border border-secondary-300 bg-secondary-50 px-4 py-2.5 text-sm outline-none focus:border-primary-400"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-3 rounded-xl bg-primary-500 text-white disabled:opacity-40 hover:bg-primary-600 transition-colors"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
          <p className="mt-1.5 text-[10px] text-gray-400 flex items-center gap-1">
            <MessageCircleHeart size={11} />
            Em emergências, procure um veterinário ou ligue 156.
          </p>
        </div>
      </div>
    </div>
  );
}
