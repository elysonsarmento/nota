import React, { useState } from 'react';
import { Shuffle, Copy, Check, Users, Sparkles, AlertCircle, ArrowRight, Lock, Unlock, ChevronDown, ChevronUp, RotateCw, ShieldCheck, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { drawTeams, rotateTeamsForNextSet } from '../utils/balancer';
import { POSITIONS, getAggregatedPlayerScore, formatScore } from '../constants/volleyball';
import { copyToClipboardUniversal } from '../utils/clipboard';

const MODALITIES = [
  { id: 'court6', label: '🏐 Quadra 6x6 (Rotação 4x2)', playersPerTeam: 6, desc: 'Padrão oficial com rotação 4x2' },
  { id: 'beach4', label: '🏖️ Areia 4x4 (Quarteto)', playersPerTeam: 4, desc: 'Vôlei de praia/areia em quartetos' },
  { id: 'beach3', label: '🏖️ Areia 3x3 (Trio)', playersPerTeam: 3, desc: 'Vôlei de praia/areia em trios' },
  { id: 'beach2', label: '🏖️ Areia 2x2 (Dupla)', playersPerTeam: 2, desc: 'Vôlei de praia/areia em duplas' }
];

export function TeamDraw({ players, onGoToCoinToss, currentDrawResult, setDrawResult }) {
  const [selectedModality, setSelectedModality] = useState('court6');
  const [numTeams, setNumTeams] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(6);
  const [mode, setMode] = useState('smart'); // 'smart', 'rating', 'random'
  const [copied, setCopied] = useState(false);
  const [rotatedMessage, setRotatedMessage] = useState(false);
  const [lockedAssignments, setLockedAssignments] = useState({}); // { [playerId]: teamIndex }
  const [showLockPanel, setShowLockPanel] = useState(false);

  const presentPlayers = players.filter((p) => p.present);

  const handleModalityChange = (modId) => {
    setSelectedModality(modId);
    const found = MODALITIES.find((m) => m.id === modId);
    if (found) {
      setPlayersPerTeam(found.playersPerTeam);
    }
  };

  const handleToggleLock = (playerId, teamIndex) => {
    setLockedAssignments((prev) => {
      const current = prev[playerId];
      if (current === teamIndex) {
        const copy = { ...prev };
        delete copy[playerId];
        return copy;
      }
      return { ...prev, [playerId]: teamIndex };
    });
  };

  const clearLocks = () => {
    setLockedAssignments({});
  };

  const lockedCount = Object.keys(lockedAssignments).length;

  const handleDraw = () => {
    if (presentPlayers.length < numTeams * 2) {
      alert(`Você precisa de pelo menos ${numTeams * 2} jogadores presentes para formar ${numTeams} times.`);
      return;
    }

    const result = drawTeams({
      players,
      numTeams,
      playersPerTeam,
      mode,
      lockedAssignments
    });

    setDrawResult(result);

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleRotateReserves = () => {
    if (!currentDrawResult || !currentDrawResult.reserves || currentDrawResult.reserves.length === 0) {
      alert('Não há reservas para revezar neste momento.');
      return;
    }

    const updated = rotateTeamsForNextSet(currentDrawResult.teams, currentDrawResult.reserves);
    setDrawResult(updated);
    setRotatedMessage(true);
    setTimeout(() => setRotatedMessage(false), 3000);
  };

  const copyToClipboard = async () => {
    if (!currentDrawResult || !currentDrawResult.teams) return;

    const modLabel = MODALITIES.find((m) => m.playersPerTeam === playersPerTeam)?.label || `${playersPerTeam}x${playersPerTeam}`;
    let text = `🏐 *ESCALAÇÃO DO RACHA DE VÔLEI* 🏐\nModalidade: ${modLabel}\n\n`;

    currentDrawResult.teams.forEach((team) => {
      text += `🔷 *${team.name.toUpperCase()}* (Média: ${formatScore(team.stats.avgScore)}★ | Lev: ${team.stats.settersCount})\n`;
      team.players.forEach((p, idx) => {
        const pos = POSITIONS.find((posItem) => posItem.id === p.primaryPosition);
        const posText = pos ? `[${pos.short}]` : '';
        const nick = p.nickname ? ` (${p.nickname})` : '';
        const lockIcon = p.isLocked ? ' 🔒[Fixo]' : '';
        text += `  ${idx + 1}. ${p.name}${nick} ${posText}${lockIcon}\n`;
      });
      text += `\n`;
    });

    if (currentDrawResult.reserves && currentDrawResult.reserves.length > 0) {
      text += `⏳ *RESERVAS / PRÓXIMO TIME (Revezamento)*:\n`;
      currentDrawResult.reserves.forEach((p, idx) => {
        const nick = p.nickname ? ` (${p.nickname})` : '';
        text += `  ${idx + 1}. ${p.name}${nick}\n`;
      });
      text += `\n`;
    }

    text += `Gerado pelo VolleyDraft 🏐`;

    const success = await copyToClipboardUniversal(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      alert('Selecione e copie o texto gerado manualmente caso o navegador bloqueie.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* BANNER DE SUGESTÃO INCLUSIVA (Se houver muitos jogadores para 2 times) */}
      {presentPlayers.length >= 15 && numTeams === 2 && (
        <div className="p-3 bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/40 rounded-xl sm:rounded-2xl flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-200">
                Ninguém Fica de Fora: {presentPlayers.length} atletas presentes!
              </h4>
              <p className="text-[11px] text-emerald-400/90">
                Com 2 times de 6, {presentPlayers.length - 12} ficariam esperando. Sugerimos formar <strong>3 Times de 6</strong> em rodízio (triangular).
              </p>
            </div>
          </div>
          <button
            onClick={() => setNumTeams(3)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all active:scale-95"
          >
            Formar 3 Times (Todos Jogam) 🏐
          </button>
        </div>
      )}

      {/* Painel de Configuração do Sorteio */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Configurar Sorteio</h2>
              <p className="text-[11px] text-slate-400">
                {presentPlayers.length} atletas presentes no momento.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Inclusão Ativa</span>
          </div>
        </div>

        {/* 1. SELETOR DE MODALIDADE (QUADRA vs AREIA) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Tipo de Jogo / Modalidade
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MODALITIES.map((mod) => {
              const isSelected = selectedModality === mod.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleModalityChange(mod.id)}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs truncate">{mod.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{mod.playersPerTeam} por equipe</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. PARÂMETROS DO SORTEIO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quantidade de Times
            </label>
            <select
              value={numTeams}
              onChange={(e) => setNumTeams(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value={2}>2 Times (Tradicional)</option>
              <option value={3}>3 Times (Rodízio Triangular - Recomendado)</option>
              <option value={4}>4 Times (Torneio)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Jogadores por Time (Titulares)
            </label>
            <select
              value={playersPerTeam}
              onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value={6}>6 Jogadores (Quadra 4x2)</option>
              <option value={5}>5 Jogadores</option>
              <option value={4}>4 Jogadores (Quarteto Areia)</option>
              <option value={3}>3 Jogadores (Trio Areia)</option>
              <option value={2}>2 Jogadores (Dupla Areia)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Modo de Balanceamento
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="smart">🎯 Inclusivo & Tático (Cotas de nível + Posições)</option>
              <option value="rating">⚖️ Somente por Nota (Rating)</option>
              <option value="random">🎲 Aleatório Puro</option>
            </select>
          </div>
        </div>

        {/* 3. PAINEL DE JOGADORES FIXOS */}
        <div className="border border-slate-800 bg-slate-950/70 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowLockPanel(!showLockPanel)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Fixar Jogadores em Times Específicos</span>
              {lockedCount > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                  {lockedCount} fixado(s)
                </span>
              )}
            </div>
            {showLockPanel ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showLockPanel && (
            <div className="p-3 border-t border-slate-800 space-y-2.5 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Clique no time desejado para travar o atleta. Os demais jogadores serão sorteados ao redor deles:
                </p>
                {lockedCount > 0 && (
                  <button
                    type="button"
                    onClick={clearLocks}
                    className="text-[10px] text-red-400 hover:text-red-300 underline"
                  >
                    Limpar Fixos
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {presentPlayers.map((player) => {
                  const assigned = lockedAssignments[player.id];
                  const pos = POSITIONS.find((p) => p.id === player.primaryPosition);

                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate font-semibold text-white">{player.name}</span>
                        {pos && (
                          <span className="text-[10px] text-slate-400 font-mono">[{pos.short}]</span>
                        )}
                      </div>

                      {/* Botões dos Times */}
                      <div className="flex items-center gap-1 shrink-0">
                        {Array.from({ length: numTeams }, (_, tIdx) => {
                          const isLockedHere = assigned === tIdx;
                          const teamLetter = String.fromCharCode(65 + tIdx);
                          return (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => handleToggleLock(player.id, tIdx)}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                isLockedHere
                                  ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-300 shadow-sm'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {isLockedHere ? `🔒 Time ${teamLetter}` : `Time ${teamLetter}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Resumo e Botão de Sortear */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>
              Total de vagas: <strong className="text-white">{numTeams * playersPerTeam}</strong>
              {presentPlayers.length > numTeams * playersPerTeam && (
                <span className="text-amber-400 ml-1.5">
                  ({presentPlayers.length - numTeams * playersPerTeam} no revezamento)
                </span>
              )}
            </span>
          </div>

          <button
            onClick={handleDraw}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" /> Sortear Times Agora
          </button>
        </div>
      </div>

      {/* Exibição dos Times Sorteados */}
      {currentDrawResult && currentDrawResult.teams && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>🏐</span> Times Formados
              </h3>
              <p className="text-[11px] text-slate-400">
                Inclusão balanceada: cotas equivalentes de iniciantes em cada equipe.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {currentDrawResult.reserves && currentDrawResult.reserves.length > 0 && (
                <button
                  onClick={handleRotateReserves}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/40 transition-colors shadow-sm"
                  title="Coloca quem estava na reserva para jogar no próximo set"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rodar Próximo Set
                </button>
              )}

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Zap'}
              </button>

              <button
                onClick={onGoToCoinToss}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <span>🪙</span> Bola/Lado <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {rotatedMessage && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>Rodízio aplicado com sucesso! Os atletas que descansavam agora são titulares para o novo set.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {currentDrawResult.teams.map((team, idx) => (
              <div
                key={team.id}
                className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-4 shadow-xl relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : idx === 1
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-400'
                      : idx === 2
                      ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                      : 'bg-gradient-to-r from-purple-500 to-pink-400'
                  }`}
                />

                {/* Header do Time */}
                <div className="flex items-center justify-between mb-3 mt-0.5">
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white">{team.name}</h4>
                    <span className="text-[10px] text-slate-400">
                      {team.players.length} titulares
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                      Média: {formatScore(team.stats.avgScore)}★
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px]">
                      Lev: {team.stats.settersCount}
                    </span>
                  </div>
                </div>

                {/* Métricas táticas da equipe */}
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800 mb-2.5 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">🔄 Rotação 4x2 média:</span>
                    <span className="font-semibold text-amber-400">{formatScore(team.stats.avgRotation)} / 5</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">🛡️ Passe / Defesa médio:</span>
                    <span className="font-semibold text-blue-400">{formatScore(team.stats.avgPassing)} / 5</span>
                  </div>
                </div>

                {/* Lista de Atletas no Time */}
                <div className="space-y-1.5">
                  {team.players.map((p, pIndex) => {
                    const pos = POSITIONS.find((item) => item.id === p.primaryPosition) || POSITIONS[0];
                    const score = getAggregatedPlayerScore(p);

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-4 text-center font-mono text-slate-500 text-[10px]">
                            {pIndex + 1}.
                          </span>
                          <span className="font-semibold text-white truncate">{p.name}</span>
                          {p.nickname && (
                            <span className="text-[10px] text-slate-400 truncate">({p.nickname})</span>
                          )}
                          {p.isLocked && (
                            <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0">
                              🔒 Fixo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${pos.color}`}>
                            {pos.icon} {pos.short}
                          </span>
                          <span className="font-bold text-amber-400 text-[11px]">{formatScore(score)}★</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* BANCO DE RESERVAS / REVEZAMENTO DEMOCRÁTICO */}
          {currentDrawResult.reserves && currentDrawResult.reserves.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
                  <span>⏳</span> Fila de Revezamento / Próximo Set ({currentDrawResult.reserves.length} atletas)
                </h4>
                <span className="text-[10px] text-slate-400">
                  Descanso rotativo entre todos os níveis
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Para o próximo set, clique no botão <strong>"Rodar Próximo Set"</strong> para revezar automaticamente quem descansou com os titulares.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {currentDrawResult.reserves.map((p, rIdx) => {
                  const pos = POSITIONS.find((item) => item.id === p.primaryPosition) || POSITIONS[0];
                  return (
                    <div
                      key={p.id}
                      className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-slate-500 text-[10px]">{rIdx + 1}.</span>
                        <span className="font-medium text-white truncate">{p.name}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] border ${pos.color} shrink-0`}>
                        {pos.short}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
