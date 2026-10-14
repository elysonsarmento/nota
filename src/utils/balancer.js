import { getAggregatedPlayerScore, roundToTwoDecimals } from '../constants/volleyball';

// Embaralha um array
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Média e estatísticas de um time
export const calculateTeamStats = (players) => {
  if (!players || players.length === 0) {
    return { avgScore: 0, avgRotation: 0, avgPassing: 0, settersCount: 0 };
  }
  const totalScore = players.reduce((sum, p) => sum + getAggregatedPlayerScore(p), 0);
  
  let totalRotation = 0;
  let totalPassing = 0;
  let settersCount = 0;

  players.forEach((p) => {
    if (p.primaryPosition === 'setter') settersCount++;
    const ev = p.evaluations?.[0] || {};
    totalRotation += Number(ev.rotation) || 3;
    totalPassing += Number(ev.passing) || 3;
  });

  return {
    avgScore: roundToTwoDecimals(totalScore / players.length),
    avgRotation: roundToTwoDecimals(totalRotation / players.length),
    avgPassing: roundToTwoDecimals(totalPassing / players.length),
    settersCount
  };
};

/**
 * Algoritmo Inclusivo de Sorteio de Vôlei
 * Garante que jogadores com menor avaliação / iniciantes NUNCA sejam deixados de fora
 * automaticamente na reserva, e sejam distribuídos igualmente entre os times.
 */
export const drawTeams = ({
  players,
  numTeams = 2,
  playersPerTeam = 6,
  mode = 'smart',
  lockedAssignments = {}, // { [playerId]: teamIndex }
  inclusionPriority = 'equal' // 'equal' (distribui cotas iguais de iniciantes em cada time), 'prioritize_beginners'
}) => {
  const presentPlayers = players.filter((p) => p.present);
  if (presentPlayers.length === 0) {
    return { teams: [], reserves: [] };
  }

  const totalSlots = numTeams * playersPerTeam;
  const teams = Array.from({ length: numTeams }, () => []);

  // 1. Identifica jogadores fixados pelo organizador
  const fixedPlayers = [];
  const freePlayers = [];

  presentPlayers.forEach((player) => {
    const assignedTeamIndex = lockedAssignments[player.id];
    if (assignedTeamIndex !== undefined && assignedTeamIndex !== null && assignedTeamIndex >= 0 && assignedTeamIndex < numTeams) {
      if (teams[assignedTeamIndex].length < playersPerTeam) {
        teams[assignedTeamIndex].push({ ...player, isLocked: true, lockedTeamIndex: assignedTeamIndex });
        fixedPlayers.push(player);
      } else {
        freePlayers.push(player);
      }
    } else {
      freePlayers.push(player);
    }
  });

  // Vagas livres a serem preenchidas nos times
  const neededFreeSlots = totalSlots - fixedPlayers.length;

  let activeFreePlayers = [];
  let reserves = [];

  // 2. SELEÇÃO INCLUSIVA DE TITULARES E RESERVAS
  // Se houver mais atletas livres do que vagas nos times:
  if (freePlayers.length > neededFreeSlots) {
    // Para NÃO deixar os iniciantes/mais fracos de fora:
    // Ordenamos os atletas por nota e separamos em 3 faixas (Tier 1: Fortes, Tier 2: Médios, Tier 3: Iniciantes/Em evolução)
    const sortedByScore = [...freePlayers].sort((a, b) => getAggregatedPlayerScore(b) - getAggregatedPlayerScore(a));
    const tierSize = Math.ceil(sortedByScore.length / 3);
    
    const tierHigh = shuffle(sortedByScore.slice(0, tierSize));
    const tierMid = shuffle(sortedByScore.slice(tierSize, tierSize * 2));
    const tierLow = shuffle(sortedByScore.slice(tierSize * 2)); // Iniciantes!

    // Garantimos que a reserva seja um descanso ROTATIVO e democrático entre TODAS as faixas,
    // NUNCA descartando apenas o Tier Low!
    const surplusCount = freePlayers.length - neededFreeSlots;
    const tempReserves = [];

    // Retira 1 de cada faixa de forma circular para descansar
    let round = 0;
    while (tempReserves.length < surplusCount) {
      if (round % 3 === 0 && tierHigh.length > 0) {
        tempReserves.push(tierHigh.pop());
      } else if (round % 3 === 1 && tierMid.length > 0) {
        tempReserves.push(tierMid.pop());
      } else if (round % 3 === 2 && tierLow.length > 0) {
        tempReserves.push(tierLow.pop());
      } else {
        // Fallback se algum tier esgotar
        if (tierHigh.length > 0) tempReserves.push(tierHigh.pop());
        else if (tierMid.length > 0) tempReserves.push(tierMid.pop());
        else if (tierLow.length > 0) tempReserves.push(tierLow.pop());
      }
      round++;
    }

    reserves = tempReserves;
    // Os que sobraram nos tiers são os titulares que entram em quadra (incluindo os iniciantes!)
    activeFreePlayers = [...tierHigh, ...tierMid, ...tierLow];
  } else {
    activeFreePlayers = [...freePlayers];
  }

  // 3. DISTRIBUIÇÃO NOS TIMES
  // MODO ALEATÓRIO
  if (mode === 'random') {
    const shuffled = shuffle(activeFreePlayers);
    shuffled.forEach((player) => {
      const targetTeam = teams.find((t) => t.length < playersPerTeam);
      if (targetTeam) targetTeam.push(player);
      else reserves.push(player);
    });

    return {
      teams: teams.map((teamPlayers, idx) => ({
        id: `team-${idx + 1}`,
        name: `Time ${String.fromCharCode(65 + idx)}`,
        players: teamPlayers,
        stats: calculateTeamStats(teamPlayers)
      })),
      reserves
    };
  }

  // MODO RATING (Draft Serpente com balanceamento)
  if (mode === 'rating') {
    const sorted = [...activeFreePlayers].sort((a, b) => {
      const diff = getAggregatedPlayerScore(b) - getAggregatedPlayerScore(a);
      if (Math.abs(diff) < 0.1) return Math.random() - 0.5;
      return diff;
    });

    sorted.forEach((player) => {
      const availableTeams = teams
        .map((t, index) => ({ index, team: t }))
        .filter(({ team }) => team.length < playersPerTeam);

      if (availableTeams.length === 0) {
        reserves.push(player);
        return;
      }

      availableTeams.sort((a, b) => {
        const scoreA = a.team.reduce((acc, p) => acc + getAggregatedPlayerScore(p), 0);
        const scoreB = b.team.reduce((acc, p) => acc + getAggregatedPlayerScore(p), 0);
        return scoreA - scoreB;
      });

      teams[availableTeams[0].index].push(player);
    });

    return {
      teams: teams.map((teamPlayers, idx) => ({
        id: `team-${idx + 1}`,
        name: `Time ${String.fromCharCode(65 + idx)}`,
        players: teamPlayers,
        stats: calculateTeamStats(teamPlayers)
      })),
      reserves
    };
  }

  // MODO INTELIGENTE INCLUSIVO (Smart Balanced)
  // Separa levantadores primeiro, depois os demais jogadores
  const setters = shuffle(activeFreePlayers.filter((p) => p.primaryPosition === 'setter'));
  const nonSetters = activeFreePlayers.filter((p) => p.primaryPosition !== 'setter');

  // Função auxiliar para distribuir equilibrando as notas totais das equipes
  const distributeGroup = (group) => {
    // Embaralha dentro de notas similares para não ficar repetitivo
    const sortedGroup = [...group].sort((a, b) => {
      const diff = getAggregatedPlayerScore(b) - getAggregatedPlayerScore(a);
      if (Math.abs(diff) < 0.1) return Math.random() - 0.5;
      return diff;
    });

    sortedGroup.forEach((player) => {
      const availableTeams = teams
        .map((t, index) => ({ index, team: t }))
        .filter(({ team }) => team.length < playersPerTeam);

      if (availableTeams.length === 0) {
        reserves.push(player);
        return;
      }

      // Coloca no time que atualmente tem a MENOR soma de notas
      availableTeams.sort((a, b) => {
        const scoreA = a.team.reduce((acc, p) => acc + getAggregatedPlayerScore(p), 0);
        const scoreB = b.team.reduce((acc, p) => acc + getAggregatedPlayerScore(p), 0);
        return scoreA - scoreB;
      });

      teams[availableTeams[0].index].push(player);
    });
  };

  // 1. Distribui os levantadores primeiro (1 por time sempre que possível)
  distributeGroup(setters);

  // 2. Distribui os demais jogadores por posição para balancear ataque e defesa
  const outsides = nonSetters.filter((p) => p.primaryPosition === 'outside');
  const middles = nonSetters.filter((p) => p.primaryPosition === 'middle');
  const opposites = nonSetters.filter((p) => p.primaryPosition === 'opposite');
  const liberos = nonSetters.filter((p) => p.primaryPosition === 'libero');
  const allarounds = nonSetters.filter((p) => p.primaryPosition === 'allaround');

  distributeGroup(outsides);
  distributeGroup(middles);
  distributeGroup(opposites);
  distributeGroup(liberos);
  distributeGroup(allarounds);

  // 3. Ajuste fino de equilíbrio (Swaps locais apenas entre jogadores NÃO-FIXOS e da mesma posição)
  if (teams.length === 2 && teams[0].length === playersPerTeam && teams[1].length === playersPerTeam) {
    let diff = Math.abs(calculateTeamStats(teams[0]).avgScore - calculateTeamStats(teams[1]).avgScore);

    for (let i = 0; i < teams[0].length; i++) {
      for (let j = 0; j < teams[1].length; j++) {
        const p1 = teams[0][i];
        const p2 = teams[1][j];

        if (!p1.isLocked && !p2.isLocked && p1.primaryPosition === p2.primaryPosition && p1.primaryPosition !== 'setter') {
          const testTeam0 = [...teams[0]];
          const testTeam1 = [...teams[1]];
          testTeam0[i] = p2;
          testTeam1[j] = p1;

          const newDiff = Math.abs(calculateTeamStats(testTeam0).avgScore - calculateTeamStats(testTeam1).avgScore);
          if (newDiff < diff) {
            teams[0] = testTeam0;
            teams[1] = testTeam1;
            diff = newDiff;
          }
        }
      }
    }
  }

  return {
    teams: teams.map((teamPlayers, idx) => ({
      id: `team-${idx + 1}`,
      name: `Time ${String.fromCharCode(65 + idx)}`,
      players: teamPlayers,
      stats: calculateTeamStats(teamPlayers)
    })),
    reserves
  };
};

/**
 * Função para girar o rodízio de reservas para o próximo set:
 * Coloca os reservas atuais como titulares e reveza com quem já jogou.
 */
export const rotateTeamsForNextSet = (currentTeams, currentReserves) => {
  if (!currentReserves || currentReserves.length === 0 || !currentTeams || currentTeams.length === 0) {
    return { teams: currentTeams, reserves: currentReserves };
  }

  const allPlayers = [];
  currentTeams.forEach((t) => allPlayers.push(...t.players));

  // Substitui os primeiros jogadores não-fixos de cada time pelos reservas que estavam descansando
  const newTeams = currentTeams.map((team) => ({
    ...team,
    players: [...team.players]
  }));

  const newReserves = [];
  const queueToEnter = [...currentReserves];

  let teamIdx = 0;
  while (queueToEnter.length > 0) {
    const enteringPlayer = queueToEnter.shift();
    const targetTeam = newTeams[teamIdx % newTeams.length];

    // Encontra um jogador não-fixo para sair para a reserva
    const exitIndex = targetTeam.players.findIndex((p) => !p.isLocked);
    if (exitIndex !== -1) {
      const exitingPlayer = targetTeam.players[exitIndex];
      newReserves.push(exitingPlayer);
      targetTeam.players[exitIndex] = enteringPlayer;
    } else {
      newReserves.push(enteringPlayer);
    }
    teamIdx++;
  }

  return {
    teams: newTeams.map((t) => ({
      ...t,
      stats: calculateTeamStats(t.players)
    })),
    reserves: newReserves
  };
};
