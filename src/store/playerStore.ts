import { create } from 'zustand';
import type { Player } from '@/types';
import { MOCK_PLAYERS } from '@/data/mockData';

const PLAYER_STORAGE_KEY = 'metaverse-island-players-v1';

function loadPlayerState() {
  try {
    const saved = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch { return null; }
}

const savedPlayerState = loadPlayerState();

interface PlayerStore {
  currentPlayer: Player;
  players: Player[];
  setCurrentPlayer: (player: Player) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
}

const initialCurrentPlayer = savedPlayerState?.currentPlayer || MOCK_PLAYERS[0];
const initialPlayers = savedPlayerState?.players || MOCK_PLAYERS;

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentPlayer: initialCurrentPlayer,
  players: initialPlayers,
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  updatePlayer: (id, updates) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentPlayer: state.currentPlayer.id === id
        ? { ...state.currentPlayer, ...updates }
        : state.currentPlayer,
    })),
  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players, player],
    })),
  removePlayer: (id) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    })),
}));

usePlayerStore.subscribe((state) => {
  try {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({
      currentPlayer: state.currentPlayer,
      players: state.players,
    }));
  } catch {}
});
