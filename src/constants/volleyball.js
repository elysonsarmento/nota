export const POSITIONS = [
  { id: 'setter', label: 'Levantador', short: 'LEV', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🤲' },
  { id: 'outside', label: 'Ponteiro', short: 'PON', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: '⚡' },
  { id: 'middle', label: 'Central / Meio', short: 'CEN', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '🛡️' },
  { id: 'opposite', label: 'Oposto', short: 'OPO', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: '💥' },
  { id: 'libero', label: 'Líbero', short: 'LIB', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40', icon: '🧤' },
  { id: 'allaround', label: 'Geral / Coringa', short: 'GER', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', icon: '🏐' }
];

export const ROTATION_LEVELS = [
  { level: 1, label: 'Nível 1 - Sem noção de rotação', desc: 'Joga fixo ou recreativo. Não conhece a movimentação de rodízio.' },
  { level: 2, label: 'Nível 2 - Rotação básica inicial', desc: 'Sabe girar em sentido horário (posições 1 a 6), mas precisa de auxílio constante.' },
  { level: 3, label: 'Nível 3 - Rotação 4x2 Intermediária', desc: 'Entende a formação 4x2, sabe onde o levantador fica, mas às vezes se perde nas trocas.' },
  { level: 4, label: 'Nível 4 - Domínio bom do 4x2', desc: 'Conhece bem as posições no 4x2, faz as trocas corretas no saque/recepção.' },
  { level: 5, label: 'Nível 5 - Especialista em Rotação', desc: 'Domina rotação 4x2 e 5x1, orienta os companheiros e não comete faltas de posição.' }
];

export const SKILL_CRITERIA = [
  {
    key: 'rotation',
    label: 'Conhecimento de Rotação (ex: 4x2)',
    desc: 'Grau de entendimento das posições, rodízio e trocas táticas na quadra.',
    weight: 1.2
  },
  {
    key: 'passing',
    label: 'Passe / Recepção',
    desc: 'Qualidade de manchete, recepção de saque e defesa no fundo.',
    weight: 1.3
  },
  {
    key: 'setting',
    label: 'Levantamento',
    desc: 'Toque, precisão e distribuição de bola para os atacantes.',
    weight: 1.1
  },
  {
    key: 'spiking',
    label: 'Ataque / Finalização',
    desc: 'Potência, impulsão, colocação de bola e finalização na rede.',
    weight: 1.1
  },
  {
    key: 'serving',
    label: 'Saque',
    desc: 'Regularidade, precisão e dificuldade imposta no saque.',
    weight: 1.0
  },
  {
    key: 'blocking',
    label: 'Bloqueio',
    desc: 'Tempo de bola, postura de mãos e fechamento na rede.',
    weight: 1.0
  }
];

export const roundToTwoDecimals = (num) => {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
};

export const formatScore = (num) => {
  const val = Number(num) || 0;
  // Se for decimal, formata com até 2 casas (ex: 4.55 ou 4.5)
  return Number.isInteger(val) ? val.toFixed(1) : val.toString();
};

export const calculatePlayerScore = (evaluation) => {
  if (!evaluation) return 3.0;
  let totalWeighted = 0;
  let totalWeight = 0;

  SKILL_CRITERIA.forEach((crit) => {
    const val = parseFloat(evaluation[crit.key]) || 3;
    totalWeighted += val * crit.weight;
    totalWeight += crit.weight;
  });

  const raw = totalWeighted / totalWeight;
  return roundToTwoDecimals(raw);
};

export const getAggregatedPlayerScore = (player) => {
  if (!player) return 3.0;

  // Se o usuário optou pelo modo de Nota Geral direta
  if (player.evaluationMode === 'manual' && player.manualScore !== undefined && player.manualScore !== null && player.manualScore !== '') {
    return roundToTwoDecimals(parseFloat(player.manualScore) || 3.0);
  }

  // Se tiver avaliações detalhadas
  if (player.evaluations && player.evaluations.length > 0) {
    const sum = player.evaluations.reduce((acc, ev) => acc + calculatePlayerScore(ev), 0);
    return roundToTwoDecimals(sum / player.evaluations.length);
  }

  if (player.manualScore !== undefined && player.manualScore !== null) {
    return roundToTwoDecimals(parseFloat(player.manualScore) || 3.0);
  }

  return 3.0;
};
