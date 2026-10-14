import React, { useState } from 'react';
import { UserPlus, Search, CheckCircle2, Circle, Edit3, Award, Users, Star, Trash2, ClipboardList } from 'lucide-react';
import { POSITIONS, getAggregatedPlayerScore, formatScore } from '../constants/volleyball';

export function PlayerList({
  players,
  onTogglePresent,
  onEditPlayer,
  onAddPlayer,
  onToggleAllPresent,
  onClearAll,
  onOpenImport
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'score', 'position'

  const presentCount = players.filter((p) => p.present).length;
  const totalCount = players.length;

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.nickname && player.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPos = selectedPosition === 'all' || player.primaryPosition === selectedPosition;
    return matchesSearch && matchesPos;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === 'score') {
      return getAggregatedPlayerScore(b) - getAggregatedPlayerScore(a);
    }
    if (sortBy === 'position') {
      return a.primaryPosition.localeCompare(b.primaryPosition);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-3.5">
      {/* Barra de Ações do Topo */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Elenco & Presença
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                {presentCount} presentes de {totalCount}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Marque quem foi para o jogo hoje antes de sortear os times.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {totalCount > 0 && (
            <>
              <button
                onClick={() => onToggleAllPresent(true)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Todos
              </button>
              <button
                onClick={() => onToggleAllPresent(false)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Nenhum
              </button>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                title="Apagar todos os jogadores para começar do zero"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar
              </button>
            </>
          )}

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <ClipboardList className="w-3.5 h-3.5 text-amber-400" /> Importar Lista
          </button>

          <button
            onClick={onAddPlayer}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" /> Novo Jogador
          </button>
        </div>
      </div>

      {totalCount > 0 ? (
        <>
          {/* Filtros e Busca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Campo de Busca */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou apelido..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filtro por Posição */}
            <div>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todas as posições</option>
                {POSITIONS.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.icon} {pos.label} ({pos.short})
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="name">Ordenar por Nome (A-Z)</option>
                <option value="score">Ordenar por Nível Geral (Maior)</option>
                <option value="position">Ordenar por Posição</option>
              </select>
            </div>
          </div>

          {/* Grid de Jogadores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {sortedPlayers.map((player) => {
              const pos = POSITIONS.find((p) => p.id === player.primaryPosition) || POSITIONS[0];
              const score = getAggregatedPlayerScore(player);
              const evalData = player.evaluations?.[0] || {};

              return (
                <div
                  key={player.id}
                  className={`border rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition-all ${
                    player.present
                      ? 'bg-slate-900/90 border-slate-700/80 shadow-md shadow-slate-950/40'
                      : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                  }`}
                >
                  {/* Topo do Card: Checkbox e Ações */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <button
                      onClick={() => onTogglePresent(player.id)}
                      className="flex items-center gap-2 text-left group flex-1 min-w-0"
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          player.present
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'border-2 border-slate-600 group-hover:border-slate-400'
                        }`}
                      >
                        {player.present && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="truncate">
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {player.name}
                        </h3>
                        {player.nickname && (
                          <span className="text-[10px] text-slate-400 block font-normal truncate">
                            "{player.nickname}"
                          </span>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => onEditPlayer(player)}
                      title="Editar dados e avaliações"
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges de Posição e Nível */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold border ${pos.color}`}
                    >
                      <span>{pos.icon}</span>
                      <span>{pos.label}</span>
                    </span>

                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="text-xs font-black">{formatScore(score)}</span>
                    </div>
                  </div>

                  {/* Fundamentos ou Nota Geral */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-slate-800/80">
                    {player.evaluationMode === 'manual' ? (
                      <>
                        <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 col-span-2 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">🎯 Avaliação:</span>
                          <span className="font-bold text-amber-300">
                            Nota Geral Direta ({formatScore(score)}★)
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">🔄 Rotação 4x2</span>
                          <span className="font-bold text-amber-300">
                            Nível {evalData.rotation || 3}/5
                          </span>
                        </div>

                        <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">🛡️ Passe / Defesa</span>
                          <span className="font-bold text-blue-300">
                            Nota {evalData.passing || 3}/5
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {sortedPlayers.length === 0 && (
            <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Nenhum jogador encontrado com os filtros atuais.</p>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto mb-3">
            🏐
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">Nenhum jogador cadastrado ainda</h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Você pode colar a lista do seu grupo do WhatsApp diretamente ou cadastrar os atletas um a um!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={onOpenImport}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
            >
              <ClipboardList className="w-4 h-4 text-amber-400" /> Colar Lista do WhatsApp
            </button>
            <button
              onClick={onAddPlayer}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" /> Novo Jogador
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
