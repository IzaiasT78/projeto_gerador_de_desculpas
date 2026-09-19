/**
 * Serviço de Integração com a API da OpenAI para Geração de Desculpas Inteligentes
 */

const { generateThreeExcuses, CATEGORIES, TONES } = require('./generatorEngine');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Mapeamento amigável de destinatários
 */
const RECIPIENT_NAMES = {
  chefe: 'Chefe / Gestor(a)',
  colega: 'Colega de Trabalho / Equipe',
  amigo: 'Amigo(a) próximo / Galera do rolê',
  crush: 'Crush / Namorado(a) / Parceiro(a)',
  familia: 'Mãe / Pai / Parente',
  professor: 'Professor(a) / Coordenador(a)'
};

/**
 * Descrições de nível de absurdo
 */
const ABSURDITY_DESCRIPTIONS = {
  1: 'Nível 1 (100% Crível): Extremamente plausível, realista, discreto e seguro (ex: trânsito, problema elétrico, indisposição leve, pneu furado).',
  2: 'Nível 2 (Plausível com Detalhes): Situação comum com riqueza de detalhes cotidianos convincentes (ex: encanamento, consulta médica estendida, chave quebrada na fechadura).',
  3: 'Nível 3 (Incomum / Arriscado): Imprevisto inusitado e curioso, mas ainda passível de ter acontecido (ex: preso no elevador, incidente com animal doméstico, socorrendo alguém na rua).',
  4: 'Nível 4 (Cara de Pau Extrema): Bastante audacioso, cômico e descarado (ex: crise existencial repentina diante do espelho, ataque de pombos agressivos, presságio do horóscopo).',
  5: 'Nível 5 (Caos Cósmico / Ficção Científica): Absurdo total, hilário, surreal e cinematográfico (ex: falha na matrix, perturbação no espaço-tempo, assistente de IA se rebelando).'
};

/**
 * Gera 3 desculpas utilizando a API da OpenAI
 */
async function generateExcuseWithOpenAI({
  category = 'trabalho',
  recipient = 'chefe',
  tone = 'corporativo',
  absurdityLevel = 1,
  situation = ''
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Se não houver chave da OpenAI configurada, faz o fallback gracioso gerando 3 desculpas
  if (!apiKey || apiKey.trim() === '' || apiKey === 'sua_chave_openai_aqui') {
    console.log('ℹ️ [OpenAI] Chave OPENAI_API_KEY não configurada no .env. Utilizando motor offline com 3 variações.');
    const fallback = generateThreeExcuses({ category, recipient, tone, absurdityLevel, situation });
    return {
      ...fallback,
      source: 'offline',
      notice: 'Chave da OpenAI não configurada no .env. Gerado pelo motor de emergência.'
    };
  }

  const level = Math.min(Math.max(Number(absurdityLevel) || 1, 1), 5);
  const categoryName = CATEGORIES[category] || category;
  const recipientName = RECIPIENT_NAMES[recipient] || recipient;
  const toneName = TONES[tone] || tone;
  const absurdityDesc = ABSURDITY_DESCRIPTIONS[level] || ABSURDITY_DESCRIPTIONS[1];

  const systemPrompt = `Você é o maior especialista do mundo na arte de criar desculpas personalizadas, convincentes e inteligentes para qualquer situação da vida moderna.
Sua missão é gerar EXATAMENTE 3 opções distintas de desculpas para a situação informada, prontas para envio imediato (WhatsApp ou e-mail).

REGRAS OBRIGATÓRIAS:
1. Responda ESTRITAMENTE em formato JSON com a chave "excuses" contendo uma lista de 3 textos:
{
  "excuses": [
    "Texto da Opção 1 (mais direta e segura)",
    "Texto da Opção 2 (mais detalhada e circunstancial)",
    "Texto da Opção 3 (mais persuasiva e com toque extra de personalidade)"
  ]
}
2. Cada texto deve ser a mensagem final completa pronta para envio, com saudação adequada e sem aspas internas.
3. REGRA CRUCIAL: NUNCA cite nem repita a frase crua de confissão do usuário (por exemplo, se o usuário escreveu "Não quero ir na casa da sogra", JAMAIS escreva "sobre não querer ir na casa da sogra"). A mensagem enviada deve conter apenas o álibi/imprevisto criado, protegendo o segredo do usuário!
4. Respeite fielmente o destinatário, o tom e o nível de absurdo solicitados.
5. Escreva em português do Brasil natural e fluente.`;

  const userPrompt = `Gere 3 opções de desculpas com os parâmetros:
- Categoria / Ocasião: ${categoryName}
- Destinatário: ${recipientName}
- Tom da mensagem: ${toneName}
- Nível de Cara de Pau / Absurdo: ${absurdityDesc}
${situation && situation.trim() ? `- Situação específica relatada: "${situation.trim()}"` : '- Situação: Não especificada (crie 3 motivos contextuais perfeitos para esta categoria).'}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.75 + (level * 0.04),
        max_tokens: 650
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('⚠️ [OpenAI API Error]:', response.status, errData);
      throw new Error(errData?.error?.message || `Erro na API da OpenAI (${response.status})`);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content?.trim() || '{}';

    let excuses = [];
    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed.excuses) && parsed.excuses.length > 0) {
        excuses = parsed.excuses.map(s => String(s).trim());
      } else if (Array.isArray(parsed)) {
        excuses = parsed.map(s => String(s).trim());
      }
    } catch {
      excuses = rawContent.split(/\n(?:\d+[\.\)]|\-)\s+/).map(s => s.trim()).filter(Boolean);
    }

    // Garante que haja pelo menos 3 opções
    while (excuses.length < 3) {
      const fallbackPiece = generateThreeExcuses({ category, recipient, tone, absurdityLevel, situation });
      excuses.push(fallbackPiece.excuses[excuses.length] || fallbackPiece.generatedExcuse);
    }

    return {
      category,
      categoryName,
      recipient,
      recipientName,
      tone,
      toneName,
      absurdityLevel: level,
      situation: situation ? situation.trim() : '',
      excuses: excuses.slice(0, 3),
      generatedExcuse: excuses[0],
      credibilityScore: `${Math.max(8, 100 - (level - 1) * 22)}%`,
      source: 'openai',
      model
    };
  } catch (err) {
    console.warn(`⚠️ [OpenAI Fallback] Falha ao comunicar com a OpenAI (${err.message}). Utilizando motor de segurança com 3 variações.`);
    const fallback = generateThreeExcuses({ category, recipient, tone, absurdityLevel, situation });
    return {
      ...fallback,
      source: 'fallback',
      notice: `Falha na OpenAI: ${err.message}. Desculpas geradas com o motor de segurança.`
    };
  }
}

module.exports = {
  generateExcuseWithOpenAI,
  RECIPIENT_NAMES,
  ABSURDITY_DESCRIPTIONS
};
