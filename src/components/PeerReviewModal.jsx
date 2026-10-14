import React, { useState } from 'react';
import { X, Star, MessageSquarePlus, Award, UserCheck } from 'lucide-react';
import { ROTATION_LEVELS } from '../constants/volleyball';

export function PeerReviewModal({ player, isOpen, onClose, onAddReview }) {
  if (!isOpen || !player) return null;

  const [reviewerName, setReviewerName] = useState('');
  const [rotation, setRotation] = useState(3);
  const [passing, setPassing] = useState(3);
  const [setting, setSetting] = useState(3);
  const [spiking, setSpiking] = useState(3);
  const [serving, setServing] = useState(3);
  const [blocking, setBlocking] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reviewerName.trim()) return;

    const newReview = {
      id: `review-${Date.now()}`,
      author: reviewerName.trim(),
      rotation: Number(rotation),
      passing: Number(passing),
      setting: Number(setting),
      spiking: Number(spiking),
      serving: Number(serving),
      blocking: Number(blocking),
      createdAt: new Date().toISOString()
    };

    onAddReview(player.id, newReview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Avaliar Colega de Time</h3>
              <p className="text-xs text-slate-400">Avalie o desempenho de <strong>{player.name}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Seu Nome (Quem está avaliando) *
            </label>
            <input
              type="text"
              required
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Ex: Carlos (Levantador)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-300 font-semibold">🔄 Conhecimento Rotação (ex: 4x2)</span>
                <span className="font-bold text-amber-400">{rotation} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRotation(lvl)}
                    className={`py-1 text-xs rounded font-bold ${
                      rotation === lvl ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-300 font-semibold">🛡️ Passe / Recepção</span>
                <span className="font-bold text-blue-400">{passing} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPassing(lvl)}
                    className={`py-1 text-xs rounded font-bold ${
                      passing === lvl ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">🤲 Levantamento: {setting}★</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSetting(lvl)}
                      className={`flex-1 py-0.5 text-[11px] rounded ${
                        setting === lvl ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">💥 Ataque: {spiking}★</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSpiking(lvl)}
                      className={`flex-1 py-0.5 text-[11px] rounded ${
                        spiking === lvl ? 'bg-purple-500 text-white font-bold' : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg shadow-md"
            >
              Enviar Avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
