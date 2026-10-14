import { POSITIONS } from '../constants/volleyball';

/**
 * Faz o parsing de uma lista colada pelo usuário (WhatsApp ou IA)
 */
export function parsePlayerListText(text) {
  if (!text || typeof text !== 'string') return [];

  const trimmed = text.trim();

  // Verifica se o usuário colou um JSON da IA
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
        return parsed.map((item, index) => {
          const detectedPos = item.primaryPosition || detectPositionFromText(item.position || '') || 'allaround';
          return {
            id: item.id || `p-imp-${Date.now()}-${index}`,
            name: item.name.trim(),
            nickname: item.nickname || '',
            primaryPosition: detectedPos,
            present: item.present !== undefined ? Boolean(item.present) : true,
            evaluationMode: 'manual',
            manualScore: 3.50,
            evaluations: [
              {
                id: `ev-imp-${index}`,
                author: 'Importação',
                rotation: 3,
                passing: 3,
                setting: detectedPos === 'setter' ? 4 : 3,
                spiking: 3,
                serving: 3,
                blocking: 3,
                createdAt: new Date().toISOString()
              }
            ]
          };
        });
      }
    } catch (e) {
      // Continua para o parser de texto
    }
  }

  const lines = text.split('\n');
  const results = [];

  lines.forEach((line, index) => {
    let clean = line.trim();
    if (!clean) return;

    // Detecta se tem indicador de confirmação (✅, ✔️, etc.)
    const hasCheck = /[\u2705\u2714\u2713]|✅|✔️|✓|\[x\]|confirmado/i.test(clean);
    clean = clean.replace(/[\u2705\u2714\u2713]|✅|✔️|✓|\[x\]/g, '').trim();

    // Remove numeração inicial como "1 - ", "1. ", "1) ", "1- ", "01 - "
    clean = clean.replace(/^\s*\d+[\s\.\-\)\:]+\s*/, '').trim();

    if (!clean) return;

    // Tenta detectar se a linha menciona alguma posição específica
    const detectedPosition = detectPositionFromText(clean);

    // Limpa a posição do nome se estiver no final
    let finalName = clean;
    finalName = finalName.replace(/\s*[\(\-\:\/]\s*(levantador[a]?|ponteir[oa]|ponta|central|meio|opost[oa]|l[ií]bero|geral|coringa|lev|pon|cen|opo|lib)[\)]?\s*$/i, '').trim();

    results.push({
      id: `p-imp-${Date.now()}-${index}`,
      name: finalName || clean,
      nickname: '',
      primaryPosition: detectedPosition || 'allaround',
      present: hasCheck || true,
      evaluationMode: 'manual',
      manualScore: 3.50,
      evaluations: [
        {
          id: `ev-imp-${index}`,
          author: 'Lista Importada',
          rotation: 3,
          passing: 3,
          setting: detectedPosition === 'setter' ? 4 : 3,
          spiking: 3,
          serving: 3,
          blocking: 3,
          createdAt: new Date().toISOString()
        }
      ]
    });
  });

  return results;
}

export function detectPositionFromText(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('levantad') || lower.includes('lev') || lower.includes('setter')) return 'setter';
  if (lower.includes('ponteir') || lower.includes('ponta') || lower.includes('pon') || lower.includes('outside')) return 'outside';
  if (lower.includes('central') || lower.includes('meio') || lower.includes('cen') || lower.includes('middle')) return 'middle';
  if (lower.includes('opost') || lower.includes('opo') || lower.includes('opposite')) return 'opposite';
  if (lower.includes('libero') || lower.includes('líbero') || lower.includes('lib')) return 'libero';
  if (lower.includes('geral') || lower.includes('coringa') || lower.includes('all')) return 'allaround';
  return null;
}

/**
 * Gera prompt focado APENAS em mapear NOME e POSIÇÃO
 * Sem nenhuma lista mocada embutida!
 */
export function generateAIPrompt(rawListText = '') {
  const userText = rawListText.trim();
  const listSection = userText ? `\n\nLISTA DE JOGADORES:\n${userText}` : '';

  return `Atue como um organizador de vôlei. A partir da lista de jogadores que vou colar abaixo, atribua para cada pessoa APENAS a sua FUNÇÃO/POSIÇÃO primária mais provável no vôlei. NÃO precisa atribuir notas.

POSIÇÕES VÁLIDAS:
- "setter" (Levantador)
- "outside" (Ponteiro)
- "middle" (Central/Meio de rede)
- "opposite" (Oposto)
- "libero" (Líbero)
- "allaround" (Geral/Coringa/Iniciante)

RETORNE APENAS o JSON no formato:
[
  { "name": "Nome da pessoa", "position": "setter|outside|middle|opposite|libero|allaround" }
]${listSection}`;
}
