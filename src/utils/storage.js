import { INITIAL_PLAYERS } from '../data/initialPlayers';

const STORAGE_KEY = 'volley_draft_players_v2'; // Chave limpa

export const loadPlayers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      savePlayers(INITIAL_PLAYERS);
      return INITIAL_PLAYERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PLAYERS;
  } catch (err) {
    console.error('Falha ao carregar jogadores do localStorage:', err);
    return INITIAL_PLAYERS;
  }
};

export const savePlayers = (players) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (err) {
    console.error('Falha ao salvar jogadores:', err);
  }
};

export const exportPlayersBackup = (players) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(players, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `volei_jogadores_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
