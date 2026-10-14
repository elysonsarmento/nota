import React, { useState, useEffect } from 'react';
import { Users, Shuffle, Coins, BarChart2, Volleyball, Plus } from 'lucide-react';
import { loadPlayers, savePlayers } from './utils/storage';
import { PlayerList } from './components/PlayerList';
import { PlayerModal } from './components/PlayerModal';
import { ImportListModal } from './components/ImportListModal';
import { TeamDraw } from './components/TeamDraw';
import { CoinToss } from './components/CoinToss';
import { StatsView } from './components/StatsView';

export default function App() {
  const [players, setPlayers] = useState(() => loadPlayers());
  const [activeTab, setActiveTab] = useState('players'); // 'players', 'draw', 'toss', 'stats'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [drawResult, setDrawResult] = useState(null);

  // Salva no localStorage sempre que houver alteração
  useEffect(() => {
    savePlayers(players);
  }, [players]);

  // Alternar presença de um jogador
  const handleTogglePresent = (id) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, present: !p.present } : p))
    );
  };

  // Alternar todos presentes / ausentes
  const handleToggleAllPresent = (val) => {
    setPlayers((prev) => prev.map((p) => ({ ...p, present: val })));
  };

  // Abrir modal para novo jogador
  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar jogador existente
  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setIsModalOpen(true);
  };

  // Salvar jogador criado ou editado
  const handleSavePlayer = (savedPlayer) => {
    setPlayers((prev) => {
      const exists = prev.some((p) => p.id === savedPlayer.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPlayer.id ? savedPlayer : p));
      }
      return [savedPlayer, ...prev];
    });
  };

  // Excluir jogador
  const handleDeletePlayer = (id) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  // Limpar todos os jogadores
  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os jogadores para começar do zero?')) {
      setPlayers([]);
      setDrawResult(null);
    }
  };

  // Importar jogadores a partir da lista de texto ou IA
  const handleImportPlayers = (importedList, replace = true) => {
    if (replace) {
      setPlayers(importedList);
    } else {
      setPlayers((prev) => [...prev, ...importedList]);
    }
    setDrawResult(null);
  };

  const presentCount = players.filter((p) => p.present).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* HEADER PRINCIPAL */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black text-lg sm:text-xl shrink-0">
              🏐
            </div>
            <div className="min-w-0 truncate">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5 truncate">
                <span>VolleyDraft</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Sorteio, Rotação 4x2 & Avaliação
              </p>
            </div>
          </div>

          {/* Abas de Navegação */}
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/80 p-0.5 sm:p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => setActiveTab('players')}
              title="Jogadores"
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'players'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Jogadores</span>
              <span className="text-[10px] px-1 rounded-full bg-black/20 font-bold">
                {presentCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('draw')}
              title="Sorteio"
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'draw'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sorteio</span>
            </button>

            <button
              onClick={() => setActiveTab('toss')}
              title="Bola / Lado"
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'toss'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Bola/Lado</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              title="Dados"
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'stats'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Dados</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL COM ESPAÇAMENTO OTIMIZADO */}
      <main className="max-w-6xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6 flex-1 w-full">
        {activeTab === 'players' && (
          <PlayerList
            players={players}
            onTogglePresent={handleTogglePresent}
            onToggleAllPresent={handleToggleAllPresent}
            onEditPlayer={handleEditPlayer}
            onAddPlayer={handleAddPlayer}
            onClearAll={handleClearAll}
            onOpenImport={() => setIsImportModalOpen(true)}
          />
        )}

        {activeTab === 'draw' && (
          <TeamDraw
            players={players}
            onGoToCoinToss={() => setActiveTab('toss')}
            currentDrawResult={drawResult}
            setDrawResult={setDrawResult}
          />
        )}

        {activeTab === 'toss' && (
          <CoinToss teams={drawResult?.teams} />
        )}

        {activeTab === 'stats' && (
          <StatsView
            players={players}
            onResetPlayers={(newPlayers) => setPlayers(newPlayers)}
            onImportPlayers={(imported) => setPlayers(imported)}
          />
        )}
      </main>

      {/* MODAL DE JOGADOR / AVALIAÇÃO MANUAL */}
      <PlayerModal
        isOpen={isModalOpen}
        player={editingPlayer}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlayer}
        onDelete={handleDeletePlayer}
      />

      {/* MODAL DE IMPORTAÇÃO RÁPIDA / WHATSAPP / IA */}
      <ImportListModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportPlayers={handleImportPlayers}
      />

      {/* RODAPÉ */}
      <footer className="border-t border-slate-900 py-3 text-center text-[11px] text-slate-500">
        VolleyDraft • Organização, Avaliação & Sorteio de Vôlei
      </footer>
    </div>
  );
}
