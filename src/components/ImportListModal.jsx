import React, { useState } from 'react';
import { X, Clipboard, Bot, Check, AlertCircle, Sparkles, Eye, Copy } from 'lucide-react';
import { parsePlayerListText, generateAIPrompt } from '../utils/listParser';
import { POSITIONS } from '../constants/volleyball';
import { copyToClipboardUniversal } from '../utils/clipboard';

export function ImportListModal({ isOpen, onClose, onImportPlayers }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('text'); // 'text' ou 'ai'
  const [inputText, setInputText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showPromptText, setShowPromptText] = useState(false);

  const handleParse = (textToParse = inputText) => {
    const list = parsePlayerListText(textToParse);
    setParsedPreview(list);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (val.trim()) {
      handleParse(val);
    } else {
      setParsedPreview([]);
    }
  };


  const handlePositionChange = (index, newPos) => {
    setParsedPreview((prev) =>
      prev.map((item, i) => (i === index ? { ...item, primaryPosition: newPos } : item))
    );
  };

  const handleTogglePresent = (index) => {
    setParsedPreview((prev) =>
      prev.map((item, i) => (i === index ? { ...item, present: !item.present } : item))
    );
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    onImportPlayers(parsedPreview, replaceExisting);
    onClose();
  };

  const currentPrompt = generateAIPrompt(inputText);

  const copyPromptToClipboard = async () => {
    const success = await copyToClipboardUniversal(currentPrompt);
    if (success) {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } else {
      // Se o Safari bloquear, abre o texto para selecionar com um toque
      setShowPromptText(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full my-4 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-base">
              📋
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Importação de Lista & Posições
              </h2>
              <p className="text-[11px] text-slate-400">
                Cole a lista do WhatsApp ou use o assistente de IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-semibold transition-all ${
              activeTab === 'text'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" /> Colar Lista do WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-semibold transition-all ${
              activeTab === 'ai'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> Assistente de IA (Posições)
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-200 text-xs">
          {activeTab === 'text' ? (
            <>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Cole o texto da sua lista aqui:
                </label>
              </div>

              <textarea
                value={inputText}
                onChange={handleTextChange}
                placeholder="Cole sua lista aqui (ex: 1 - Carlos ✅)..."
                rows={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
              />

              {parsedPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">
                      Jogadores Identificados ({parsedPreview.length}):
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Ajuste a posição de cada um antes de salvar
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {parsedPreview.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 gap-2"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePresent(idx)}
                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                              item.present
                                ? 'bg-emerald-500 text-slate-950 font-bold'
                                : 'border border-slate-600 text-slate-500'
                            }`}
                            title="Alternar presença"
                          >
                            {item.present && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <span className="truncate font-semibold text-white">
                            {idx + 1}. {item.name}
                          </span>
                        </div>

                        {/* Seletor de Posição Rápido */}
                        <select
                          value={item.primaryPosition}
                          onChange={(e) => handlePositionChange(idx, e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-amber-300 font-medium focus:outline-none focus:border-amber-500 shrink-0"
                        >
                          {POSITIONS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.icon} {p.short} - {p.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Aba de IA */
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <h3 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Como usar a IA para preencher as posições:
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  A IA só vai classificar o <strong>Nome</strong> e a <strong>Posição de Vôlei</strong> de cada pessoa (sem notas). Você pode colar a lista com comentários como "Carlos é levantador", "Bruna é ponteira".
                </p>
              </div>

              {/* Botão de Copiar Prompt */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Passo 1: Copiar o Prompt para IA</span>
                  <span className="text-[11px] text-slate-400">Cole no ChatGPT ou Gemini</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPromptText(!showPromptText)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> {showPromptText ? 'Ocultar Texto' : 'Ver Texto'}
                  </button>
                  <button
                    type="button"
                    onClick={copyPromptToClipboard}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all active:scale-95"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPrompt ? 'Copiado!' : 'Copiar Prompt'}
                  </button>
                </div>
              </div>

              {/* Exibição manual do prompt caso o Safari bloqueie */}
              {showPromptText && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2 animate-fade-in">
                  <span className="text-[10px] text-amber-400 font-semibold block">
                    Toque dentro da caixa abaixo e copie o texto:
                  </span>
                  <textarea
                    readOnly
                    value={currentPrompt}
                    rows={5}
                    onClick={(e) => e.target.select()}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] font-mono text-slate-300 select-all focus:outline-none"
                  />
                </div>
              )}

              {/* Passo 2: Colar Resposta */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Passo 2: Cole a resposta gerada pela IA aqui:
                </label>
                <textarea
                  value={inputText}
                  onChange={handleTextChange}
                  placeholder={`Cole o JSON gerado pela IA aqui...`}
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {parsedPreview.length > 0 && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>
                    Foram identificados <strong>{parsedPreview.length} atletas com suas posições</strong>!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>Substituir elenco atual</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={parsedPreview.length === 0}
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold rounded-xl shadow-lg transition-all"
            >
              <Check className="w-4 h-4" /> Importar {parsedPreview.length} Atletas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
