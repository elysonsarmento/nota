import React, { useState } from 'react';
import { X, Star, Save, Award, User, Info, Trash2, Zap, Sliders, Plus, Minus } from 'lucide-react';
import { POSITIONS, ROTATION_LEVELS, calculatePlayerScore, roundToTwoDecimals } from '../constants/volleyball';

export function PlayerModal({ player, isOpen, onClose, onSave, onDelete }) {
  if (!isOpen) return null;

  // Modo de avaliação: 'manual' (Apenas Nota Geral) ou 'detailed' (Questionário Completo)
  const [evaluationMode, setEvaluationMode] = useState(
    player?.evaluationMode || (player?.manualScore !== undefined ? 'manual' : 'manual')
  );

  // Estado do jogador básico
  const [name, setName] = useState(player?.name || '');
  const [nickname, setNickname] = useState(player?.nickname || '');
  const [primaryPosition, setPrimaryPosition] = useState(player?.primaryPosition || 'outside');

  // Nota Geral Manual (permite decimais finos como 4.50, 4.55, 3.25)
  const initialManualScore = player?.manualScore !== undefined
    ? String(player.manualScore)
    : player?.evaluations?.[0]
    ? String(calculatePlayerScore(player.evaluations[0]))
    : '3.50';
  const [manualScore, setManualScore] = useState(initialManualScore);

  // Fundamentos para avaliação detalhada
  const existingEvaluation = player?.evaluations?.[0] || {};
  const [rotation, setRotation] = useState(existingEvaluation.rotation || 3);
  const [passing, setPassing] = useState(existingEvaluation.passing || 3);
  const [setting, setSetting] = useState(existingEvaluation.setting || 3);
  const [spiking, setSpiking] = useState(existingEvaluation.spiking || 3);
  const [serving, setServing] = useState(existingEvaluation.serving || 3);
  const [blocking, setBlocking] = useState(existingEvaluation.blocking || 3);

  const [evaluatorName, setEvaluatorName] = useState(existingEvaluation.author || 'Organizador');

  // Ajuste fino da nota manual (+0.05, -0.05, etc.)
  const adjustScore = (delta) => {
    const current = parseFloat(manualScore) || 3.0;
    const nextVal = Math.min(5.0, Math.max(1.0, current + delta));
    setManualScore(nextVal.toFixed(2));
  };

  const calculatedDetailScore = calculatePlayerScore({
    rotation,
    passing,
    setting,
    spiking,
    serving,
    blocking
  });

  const activeOverallScore = evaluationMode === 'manual'
    ? (parseFloat(manualScore) || 3.0).toFixed(2)
    : calculatedDetailScore.toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedManual = roundToTwoDecimals(parseFloat(manualScore) || 3.0);

    const currentEval = {
      id: existingEvaluation.id || `ev-${Date.now()}`,
      author: evaluatorName || 'Organizador',
      rotation: Number(rotation),
      passing: Number(passing),
      setting: Number(setting),
      spiking: Number(spiking),
      serving: Number(serving),
      blocking: Number(blocking),
      updatedAt: new Date().toISOString()
    };

    const otherEvals = (player?.evaluations || []).slice(1);
    const updatedEvaluations = [currentEval, ...otherEvals];

    const updatedPlayer = {
      id: player?.id || `p-${Date.now()}`,
      name: name.trim(),
      nickname: nickname.trim(),
      primaryPosition,
      present: player ? player.present : true,
      evaluationMode,
      manualScore: parsedManual,
      evaluations: updatedEvaluations
    };

    onSave(updatedPlayer);
    onClose();
  };

  const getRotationDesc = (lvl) => {
    const intLvl = Math.round(Number(lvl));
    const found = ROTATION_LEVELS.find((r) => r.level === intLvl);
    return found ? found.desc : '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full my-4 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header do Modal */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
              🏐
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {player ? 'Ficha e Avaliação do Jogador' : 'Novo Jogador de Vôlei'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Defina posição e avaliação (Nota Geral ou Detalhada)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-200 text-xs">
          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Jogador *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Renata"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Apelido / Observação (Opcional)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: pai, iniciante, etc."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* POSIÇÃO PRIMÁRIA */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Função Primária de Posição *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POSITIONS.map((pos) => {
                const isSelected = primaryPosition === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setPrimaryPosition(pos.id)}
                    className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? `${pos.color} ring-2 ring-amber-400 border-transparent shadow-md`
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base sm:text-lg">{pos.icon}</span>
                    <div className="min-w-0">
                      <div className="leading-tight truncate">{pos.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">({pos.short})</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELETOR DE MODO DE AVALIAÇÃO */}
          <div className="border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Método de Avaliação
              </span>

              {/* Badge de Nível Atual */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Overall:</span>
                <span className="text-base font-black text-amber-400">{activeOverallScore}</span>
                <span className="text-xs text-amber-400/80">★</span>
              </div>
            </div>

            {/* Abas Alternar Modo */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setEvaluationMode('manual')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  evaluationMode === 'manual'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Apenas Nota Geral
              </button>
              <button
                type="button"
                onClick={() => setEvaluationMode('detailed')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  evaluationMode === 'detailed'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Questionário Detalhado
              </button>
            </div>

            {/* MODO 1: NOTA GERAL COM DECIMAIS FINOS (4.50, 4.55...) */}
            {evaluationMode === 'manual' ? (
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🎯</span> Nota Geral do Atleta (1.00 a 5.00)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Aceita notas quebradas (ex: 4.50, 4.55, 3.25) para registrar até as menores evoluções.
                    </p>
                  </div>
                </div>

                {/* Input Grande de Nota com Ajuste Fino */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                  <button
                    type="button"
                    onClick={() => adjustScore(-0.10)}
                    className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
                    title="-0.10"
                  >
                    -0.10
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustScore(-0.05)}
                    className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold text-xs"
                    title="-0.05"
                  >
                    -0.05
                  </button>

                  <div className="relative w-32 sm:w-36 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="1.00"
                      max="5.00"
                      value={manualScore}
                      onChange={(e) => setManualScore(e.target.value)}
                      className="w-full text-center text-2xl sm:text-3xl font-black bg-slate-900 border-2 border-amber-500/60 rounded-2xl py-2 text-amber-400 focus:outline-none focus:border-amber-400 shadow-inner"
                    />
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block mt-1">
                      Digite ou ajuste
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => adjustScore(0.05)}
                    className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold text-xs"
                    title="+0.05"
                  >
                    +0.05
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustScore(0.10)}
                    className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
                    title="+0.10"
                  >
                    +0.10
                  </button>
                </div>

                {/* Atalhos Rápidos */}
                <div className="flex flex-wrap gap-1.5 justify-center pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 self-center mr-1">Atalhos:</span>
                  {['2.50', '3.00', '3.50', '4.00', '4.25', '4.50', '4.55', '4.75', '5.00'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setManualScore(val)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        manualScore === val
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* MODO 2: QUESTIONÁRIO DETALHADO POR FUNDAMENTOS */
              <div className="space-y-4">
                {/* CRITÉRIO 1: ROTAÇÃO 4x2 */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>🔄</span> Conhecimento de Rotação (ex: 4x2)
                    </label>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Nível: {rotation} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2.5">
                    Entendimento da rotação, trocas e infiltrações:
                  </p>

                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setRotation(lvl)}
                        className={`py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                          rotation === lvl
                            ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] p-2 bg-slate-900 rounded-lg text-slate-300 border border-slate-800 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{getRotationDesc(rotation)}</span>
                  </div>
                </div>

                {/* CRITÉRIO 2: PASSE / RECEPÇÃO */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <span>🛡️</span> Passe / Recepção & Defesa
                    </label>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      Nota: {passing} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2.5">
                    Manchete, recepção de saque e leitura de defesa.
                  </p>

                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setPassing(lvl)}
                        className={`py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                          passing === lvl
                            ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* OUTROS CRITÉRIOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Levantamento */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-amber-200">🤲 Levantamento</span>
                      <span className="text-xs font-bold text-amber-400">{setting}/5</span>
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSetting(lvl)}
                          className={`flex-1 py-1 text-center rounded text-xs font-bold ${
                            setting === lvl ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ataque */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-purple-200">💥 Ataque</span>
                      <span className="text-xs font-bold text-purple-400">{spiking}/5</span>
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSpiking(lvl)}
                          className={`flex-1 py-1 text-center rounded text-xs font-bold ${
                            spiking === lvl ? 'bg-purple-500 text-white font-black' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Saque */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-emerald-200">⚡ Saque</span>
                      <span className="text-xs font-bold text-emerald-400">{serving}/5</span>
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setServing(lvl)}
                          className={`flex-1 py-1 text-center rounded text-xs font-bold ${
                            serving === lvl ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bloqueio */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-cyan-200">🧱 Bloqueio</span>
                      <span className="text-xs font-bold text-cyan-400">{blocking}/5</span>
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setBlocking(lvl)}
                          className={`flex-1 py-1 text-center rounded text-xs font-bold ${
                            blocking === lvl ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com botões de ação */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {player && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Tem certeza que deseja excluir ${player.name}?`)) {
                    onDelete(player.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg transition-all"
              >
                <Save className="w-4 h-4" /> Salvar Jogador
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
