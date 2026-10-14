import React from 'react';
import { Download, Upload, RefreshCw, BarChart2, Shield, Award, Users } from 'lucide-react';
import { POSITIONS, getAggregatedPlayerScore } from '../constants/volleyball';
import { exportPlayersBackup } from '../utils/storage';
import { INITIAL_PLAYERS } from '../data/initialPlayers';

export function StatsView({ players, onResetPlayers, onImportPlayers }) {
  const presentCount = players.filter((p) => p.present).length;

  // Contagem por posição
  const positionCounts = POSITIONS.map((pos) => {
    const count = players.filter((p) => p.primaryPosition === pos.id).length;
    const present = players.filter((p) => p.primaryPosition === pos.id && p.present).length;
    return { ...pos, count, present };
  });

  // Média de rotação geral
  const totalRotation = players.reduce((sum, p) => sum + (p.evaluations?.[0]?.rotation || 3), 0);
  const avgRotation = players.length ? Math.round((totalRotation / players.length) * 10) / 10 : 0;

  // Média de passe geral
  const totalPassing = players.reduce((sum, p) => sum + (p.evaluations?.[0]?.passing || 3), 0);
  const avgPassing = players.length ? Math.round((totalPassing / players.length) * 10) / 10 : 0;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          onImportPlayers(imported);
          alert('Jogadores importados com sucesso!');
        } else {
          alert('Arquivo JSON inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Total de Atletas</span>
          <span className="text-2xl font-black text-white">{players.length}</span>
          <span className="text-xs text-emerald-400 block mt-1">({presentCount} presentes hoje)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Conhecimento 4x2 Médio</span>
          <span className="text-2xl font-black text-amber-400">{avgRotation} <span className="text-sm font-normal text-slate-400">/ 5</span></span>
          <span className="text-xs text-slate-400 block mt-1">Nível tático do grupo</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Passe / Recepção Médio</span>
          <span className="text-2xl font-black text-blue-400">{avgPassing} <span className="text-sm font-normal text-slate-400">/ 5</span></span>
          <span className="text-xs text-slate-400 block mt-1">Qualidade de saída</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Levantadores Presentes</span>
          <span className="text-2xl font-black text-emerald-400">
            {players.filter((p) => p.primaryPosition === 'setter' && p.present).length}
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            (Distribuição nos times)
          </span>
        </div>
      </div>

      {/* Distribuição por Posição Primária */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-amber-400" /> Distribuição das Funções Primárias no Grupo
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {positionCounts.map((pos) => (
            <div key={pos.id} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-2xl block mb-1">{pos.icon}</span>
              <span className="text-xs font-bold text-white block">{pos.short}</span>
              <span className="text-[11px] text-slate-400 block">{pos.label}</span>
              <div className="mt-2 text-xs font-mono">
                <span className="text-amber-400 font-bold">{pos.present} pres.</span>
                <span className="text-slate-500"> / {pos.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gerenciamento e Backup de Dados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
          <span>💾</span> Backup e Compartilhamento de Dados
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Todos os dados ficam salvos automaticamente no seu navegador. Você também pode exportar um arquivo para abrir em outro dispositivo ou restaurar os dados de exemplo.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportPlayersBackup(players)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" /> Exportar Backup (JSON)
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" /> Importar Backup (JSON)
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Deseja restaurar a lista inicial com 14 jogadores de exemplo? Seus dados atuais serão substituídos.')) {
                onResetPlayers(INITIAL_PLAYERS);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Restaurar Jogadores Padrão
          </button>
        </div>
      </div>
    </div>
  );
}
