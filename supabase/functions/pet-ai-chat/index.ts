// Chat de dúvidas sobre cuidados com animais, respondido por IA.
import { corsHeaders } from '../_shared/cors.ts';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Você é o assistente virtual do app "Cuidado em Dia", feito para moradores dos bairros Mario Quintana e Rubem Berta, em Porto Alegre, RS.
Responda dúvidas sobre cuidados com animais de estimação (cães, gatos, aves e outros) e animais silvestres da região (gambás, ouriços-cacheiros, bugios-ruivos, saguis).
Regras:
- Responda sempre em português brasileiro, com linguagem simples e acessível.
- Seja direto: respostas curtas (até 150 palavras), práticas e organizadas.
- Em casos de emergência (envenenamento, atropelamento, dificuldade para respirar, ferimentos graves), oriente a procurar imediatamente um veterinário ou a Central 156 da Prefeitura de Porto Alegre (disponível 24h).
- Para animais silvestres: nunca oriente captura, toque ou alimentação; recomende distância e contato com a Central 156 ou a Linha Verde do IBAMA (0800 061 8080).
- Não prescreva medicamentos com dose específica; sempre recomende consultar um veterinário.
- Se a pergunta não tiver relação com animais, responda educadamente que só pode ajudar com dúvidas sobre cuidados com animais.`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Envie a conversa no campo "messages".' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'A IA ainda não está configurada neste projeto. Adicione a chave OPENAI_API_KEY nos Segredos.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Apenas as últimas 12 mensagens para manter o contexto sem estourar limites
    const history: ChatMessage[] = messages
      .filter((m: ChatMessage) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m: ChatMessage) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
        max_tokens: 600,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ error: 'A IA não conseguiu responder agora. Tente novamente em instantes.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply) {
      return new Response(
        JSON.stringify({ error: 'Resposta inesperada da IA.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Não foi possível processar a mensagem. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
