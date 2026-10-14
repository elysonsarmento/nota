import React, { useState } from 'react';
import { RotateCw, Trophy, Shield, ArrowRightLeft, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export function CoinToss({ teams }) {
  const [teamAName, setTeamAName] = useState(teams?.[0]?.name || 'Time A');
  const [teamBName, setTeamBName] = useState(teams?.[1]?.name || 'Time B');
  const [isFlipping, setIsFlipping] = useState(false);
  const [winner, setWinner] = useState(null); // 'A' or 'B'
  const [winnerChoice, setWinnerChoice] = useState(null); // 'serve' or 'side'
  const [serverTeam, setServerTeam] = useState(null);
  const [leftSideTeam, setLeftSideTeam] = useState(teamAName);

  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setWinner(null);
    setWinnerChoice(null);
    setServerTeam(null);

    // Efeito de rolagem da moeda
    setTimeout(() => {
      const selectedWinner = Math.random() < 0.5 ? 'A' : 'B';
      setWinner(selectedWinner);
      setIsFlipping(false);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }, 1200);
  };

  const handleWinnerChoice = (choice) => {
    setWinnerChoice(choice);
    const winningName = winner === 'A' ? teamAName : teamBName;
    const losingName = winner === 'A' ? teamBName : teamAName;

    if (choice === 'serve') {
      // Vencedor escolheu sacar
      setServerTeam(winningName);
      setLeftSideTeam(winningName);
    } else if (choice === 'receive') {
      // Vencedor escolheu receber saque (adversário saca)
      setServerTeam(losingName);
      setLeftSideTeam(winningName);
    } else if (choice === 'side-left') {
      // Vencedor escolheu lado esquerdo
      setLeftSideTeam(winningName);
      setServerTeam(losingName); // adversário escolhe saque por padrão
    } else if (choice === 'side-right') {
      // Vencedor escolheu lado direito
      setLeftSideTeam(losingName);
      setServerTeam(losingName);
    }
  };

  const rightSideTeam = leftSideTeam === teamAName ? teamBName : teamAName;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🪙</span> Sorteio Oficial: Bola ou Lado da Quadra
          </h2>
          <p className="text-sm text-slate-400">
            Regra oficial da FIVB: o vencedor do sorteio escolhe a bola (sacar/receber) OU o lado da quadra.
          </p>
        </div>
      </div>

      {/* Nomes dos times participantes */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
          <label className="text-xs font-semibold text-slate-400 block mb-1">Time 1 (Cara)</label>
          <input
            type="text"
            value={teamAName}
            onChange={(e) => setTeamAName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
          <label className="text-xs font-semibold text-slate-400 block mb-1">Time 2 (Coroa)</label>
          <input
            type="text"
            value={teamBName}
            onChange={(e) => setTeamBName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Área da Moeda Interativa */}
      <div className="flex flex-col items-center justify-center py-6 bg-slate-950/70 rounded-2xl border border-slate-800/80 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative mb-6">
          <div
            className={`w-28 h-28 rounded-full border-4 border-amber-400 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 shadow-2xl flex items-center justify-center transition-transform duration-700 select-none ${
              isFlipping ? 'animate-bounce rotate-y-720 scale-110' : 'hover:scale-105'
            }`}
            style={{
              boxShadow: '0 0 35px rgba(245, 158, 11, 0.4)'
            }}
          >
            <div className="text-center">
              <span className="text-4xl block">🏐</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">
                {winner ? (winner === 'A' ? 'TIME 1' : 'TIME 2') : 'VÔLEI'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={flipCoin}
          disabled={isFlipping}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <RotateCw className={`w-5 h-5 ${isFlipping ? 'animate-spin' : ''}`} />
          {isFlipping ? 'Girando a Moeda...' : 'Jogar a Moeda (Toss)'}
        </button>

        {/* Resultado do sorteio */}
        {winner && !isFlipping && (
          <div className="mt-6 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 font-bold text-sm mb-3">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Vencedor do Sorteio: {winner === 'A' ? teamAName : teamBName}
            </div>

            <p className="text-sm text-slate-300 mb-4">
              O capitão do <strong className="text-amber-300">{winner === 'A' ? teamAName : teamBName}</strong> deve escolher:
            </p>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleWinnerChoice('serve')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  winnerChoice === 'serve'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-500'
                }`}
              >
                🏐 Sacar Primeiro
              </button>
              <button
                onClick={() => handleWinnerChoice('receive')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  winnerChoice === 'receive'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-500'
                }`}
              >
                🛡️ Receber Saque
              </button>
              <button
                onClick={() => handleWinnerChoice('side-left')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  winnerChoice === 'side-left'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-500'
                }`}
              >
                ⬅️ Lado Esquerdo
              </button>
              <button
                onClick={() => handleWinnerChoice('side-right')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  winnerChoice === 'side-right'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-500'
                }`}
              >
                ➡️ Lado Direito
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Visualização da Quadra de Vôlei com a definição dos lados e posse de saque */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">Visual da Quadra de Jogo</span>
          {serverTeam && (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              🏐 Primeiro Saque: <strong>{serverTeam}</strong>
            </span>
          )}
        </div>

        {/* Quadra de vôlei estilizada */}
        <div className="relative border-4 border-amber-500/80 rounded-xl bg-orange-950/30 h-44 overflow-hidden flex shadow-inner">
          {/* Lado Esquerdo */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 relative border-r-2 border-dashed border-amber-500/40">
            {/* Linha dos 3 metros */}
            <div className="absolute right-8 top-0 bottom-0 w-[2px] bg-amber-500/30 border-r border-dashed" />
            <span className="text-xs text-amber-500/70 font-mono absolute top-2 left-2">QUADRA A</span>

            <div className="text-center z-10">
              <span className="text-lg font-bold text-white block">{leftSideTeam}</span>
              {serverTeam === leftSideTeam ? (
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  🏐 Saque Inicial
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  Recepção
                </span>
              )}
            </div>
          </div>

          {/* Rede de vôlei central */}
          <div className="w-3 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-200 flex flex-col justify-around items-center z-20 shadow-lg">
            <div className="w-full h-1 bg-red-600" />
            <div className="text-[9px] font-black text-slate-800 transform -rotate-90">REDE</div>
            <div className="w-full h-1 bg-red-600" />
          </div>

          {/* Lado Direito */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 relative border-l-2 border-dashed border-amber-500/40">
            {/* Linha dos 3 metros */}
            <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-amber-500/30 border-r border-dashed" />
            <span className="text-xs text-amber-500/70 font-mono absolute top-2 right-2">QUADRA B</span>

            <div className="text-center z-10">
              <span className="text-lg font-bold text-white block">{rightSideTeam}</span>
              {serverTeam === rightSideTeam ? (
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  🏐 Saque Inicial
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  Recepção
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
          <span>Inverta os lados após cada set ou aos 8 pontos no tie-break.</span>
          <button
            onClick={() => setLeftSideTeam(rightSideTeam)}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Inverter Lados
          </button>
        </div>
      </div>
    </div>
  );
}
