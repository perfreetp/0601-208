import { create } from 'zustand';
import type { Player } from '@/types';
import { MOCK_PLAYERS } from '@/data/mockData';

interface PlayerStore {
  currentPlayer: Player;
  players: Player[];
  setCurrentPlayer: (player: Player) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentPlayer: MOCK_PLAYERS[0],
  players: MOCK_PLAYERS,
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
