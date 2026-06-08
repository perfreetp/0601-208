import { create } from 'zustand';
import type {
  GameState,
  GameArea,
  Player,
  Task,
  BuildingItem,
  Achievement,
  Highlight,
  ChatMessage,
  VoteTopic,
  QuizQuestion,
  HiddenItem,
  PuzzlePiece,
  Material,
  EmoteType,
  VoteOption,
} from '@/types';
import {
  MOCK_TASKS,
  MOCK_BUILDINGS,
  MOCK_ACHIEVEMENTS,
  MOCK_HIGHLIGHTS,
  MOCK_VOTE_TOPICS,
  MOCK_QUIZ_QUESTIONS,
  MOCK_HIDDEN_ITEMS,
  MOCK_PUZZLE_PIECES,
  MOCK_MATERIALS,
  MOCK_PLAYERS,
} from '@/data/mockData';

interface GameStore extends GameState {
  setCurrentArea: (area: GameArea) => void;
  togglePause: () => void;
  setPaused: (paused: boolean) => void;
  addScore: (points: number, playerId?: string) => void;
  updateTaskStatus: (taskId: string, status: Task['status'], progress?: number) => void;
  completeTask: (taskId: string) => void;
  placeBuilding: (buildingId: string, x: number, y: number) => void;
  unlockBuilding: (buildingId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  addHighlight: (highlight: Omit<Highlight, 'id' | 'timestamp'>) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addSystemMessage: (content: string) => void;
  castVote: (topicId: string, optionId: string) => void;
  answerQuiz: (questionIndex: number, answer: number) => { correct: boolean; points: number };
  goToNextQuiz: () => number;
  sendHint: (content: string) => void;
  findHiddenItem: (itemId: string, playerId: string) => void;
  placePuzzlePiece: (pieceId: number, x: number, y: number) => void;
  consumeMaterials: (recipe: { itemId: string; count: number }[]) => boolean;
  toggleMute: (playerId: string) => void;
  toggleHandRaise: (playerId: string) => void;
  setSpeaking: (playerId: string, speaking: boolean) => void;
  triggerEmote: (playerId: string, emote: EmoteType) => void;
  movePlayer: (playerId: string, x: number, y: number) => void;
  setPlayerArea: (playerId: string, area: GameArea) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  currentArea: 'island',
  isPaused: false,
  gameTime: 3600,
  tasks: [...MOCK_TASKS],
  completedTasks: MOCK_TASKS.filter(t => t.status === 'completed').map(t => t.id),
  buildings: [...MOCK_BUILDINGS],
  achievements: [...MOCK_ACHIEVEMENTS],
  highlights: [...MOCK_HIGHLIGHTS],
  currentTaskId: null,
  currentTask: null,
  teamScore: 1425,
  messages: [
    {
      id: 'msg1',
      playerId: 'system',
      playerName: '系统',
      content: '欢迎来到元宇宙团建平台！开始你们的冒险吧~',
      timestamp: new Date(Date.now() - 600000),
      system: true,
    },
    {
      id: 'msg2',
      playerId: 'p3',
      playerName: '小红',
      content: '大家好呀！今天一起加油！',
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: 'msg3',
      playerId: 'p2',
      playerName: '小明',
      content: '好的，我们先从哪个任务开始？',
      timestamp: new Date(Date.now() - 240000),
    },
  ],
  voteTopics: [...MOCK_VOTE_TOPICS],
  materials: [...MOCK_MATERIALS],
  quizQuestions: [...MOCK_QUIZ_QUESTIONS],
  currentQuizIndex: 0,
  hiddenItems: [...MOCK_HIDDEN_ITEMS],
  puzzlePieces: [...MOCK_PUZZLE_PIECES],
  emotes: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setCurrentArea: (area) => set({ currentArea: area }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  setPaused: (paused) => set({ isPaused: paused }),

  addScore: (points, playerId) =>
    set((state) => ({
      teamScore: state.teamScore + points,
    })),

  updateTaskStatus: (taskId, status, progress) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status, progress: progress ?? t.progress } : t
      ),
      currentTask: status === 'inProgress' 
        ? state.tasks.find(t => t.id === taskId) ?? null 
        : state.currentTask,
      currentTaskId: status === 'inProgress' ? taskId : state.currentTaskId,
    })),

  completeTask: (taskId) => {
    const state = get();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t
      ),
      completedTasks: [...s.completedTasks, taskId],
      teamScore: s.teamScore + task.points,
      currentTask: null,
      currentTaskId: null,
    }));

    get().addHighlight({
      type: 'taskComplete',
      description: `🎉 团队成功完成「${task.title}」挑战！`,
      playerIds: MOCK_PLAYERS.map(p => p.id),
      points: task.points,
    });

    get().addSystemMessage(`任务「${task.title}」完成！获得 ${task.points} 团队积分`);
  },

  placeBuilding: (buildingId, x, y) =>
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === buildingId ? { ...b, placed: true, position: { x, y } } : b
      ),
    })),

  unlockBuilding: (buildingId) =>
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === buildingId ? { ...b, unlocked: true } : b
      ),
    })),

  unlockAchievement: (achievementId) => {
    const state = get();
    const achievement = state.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    set((s) => ({
      achievements: s.achievements.map((a) =>
        a.id === achievementId ? { ...a, unlocked: true, unlockedAt: new Date() } : a
      ),
    }));

    get().addHighlight({
      type: 'achievement',
      description: `🏆 解锁成就「${achievement.name}」！`,
      playerIds: ['p1'],
    });
  },

  addHighlight: (highlight) =>
    set((state) => ({
      highlights: [
        {
          ...highlight,
          id: `h-${Date.now()}`,
          timestamp: new Date(),
        },
        ...state.highlights,
      ],
    })),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date(),
        },
      ],
    })),

  addSystemMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}`,
          playerId: 'system',
          playerName: '系统',
          content,
          timestamp: new Date(),
          system: true,
        },
      ],
    })),

  castVote: (topicId, optionId) =>
    set((state) => ({
      voteTopics: state.voteTopics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              totalVotes: topic.totalVotes + 1,
              options: topic.options.map((opt) =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
              ),
            }
          : topic
      ),
    })),

  answerQuiz: (questionIndex, answer) => {
    const state = get();
    const question = state.quizQuestions[questionIndex];
    if (!question) return { correct: false, points: 0 };

    const correct = answer === question.correctAnswer;
    if (correct) {
      get().addScore(question.points);
    }

    return { correct, points: correct ? question.points : 0 };
  },

  goToNextQuiz: () => {
    const state = get();
    const nextIndex = Math.min(state.currentQuizIndex + 1, state.quizQuestions.length - 1);
    set({ currentQuizIndex: nextIndex });
    return nextIndex;
  },

  sendHint: (content) => {
    get().addSystemMessage(`💡 主持人提示：${content}`);
    get().addHighlight({
      type: 'teamWork',
      description: `💡 主持人提示：${content}`,
      playerIds: MOCK_PLAYERS.map(p => p.id),
    });
  },

  findHiddenItem: (itemId, playerId) => {
    const state = get();
    const item = state.hiddenItems.find(i => i.id === itemId);
    if (!item || item.found) return;

    set((s) => ({
      hiddenItems: s.hiddenItems.map((i) =>
        i.id === itemId ? { ...i, found: true, foundBy: playerId } : i
      ),
      teamScore: s.teamScore + 15,
    }));

    const player = MOCK_PLAYERS.find(p => p.id === playerId);
    get().addSystemMessage(`${player?.name || '某玩家'} 找到了 ${item.name}！+15分`);
  },

  placePuzzlePiece: (pieceId, x, y) =>
    set((state) => ({
      puzzlePieces: state.puzzlePieces.map((p) =>
        p.id === pieceId ? { ...p, currentX: x, currentY: y, isPlaced: true } : p
      ),
    })),

  consumeMaterials: (recipe) => {
    const state = get();
    const canConsume = recipe.every((r) => {
      const material = state.materials.find(m => m.id === r.itemId);
      return material && material.count >= r.count;
    });

    if (!canConsume) return false;

    set((s) => ({
      materials: s.materials.map((m) => {
        const recipeItem = recipe.find(r => r.itemId === m.id);
        return recipeItem ? { ...m, count: m.count - recipeItem.count } : m;
      }),
    }));

    return true;
  },

  toggleMute: (playerId) =>
    set((state) => ({
      // In a real app, update players list; here we simulate
    })),

  toggleHandRaise: (playerId) =>
    set((state) => ({
      // Simulated
    })),

  setSpeaking: (playerId, speaking) =>
    set((state) => ({
      // Simulated
    })),

  triggerEmote: (playerId, emote) =>
    set((state) => ({
      emotes: [
        { playerId, emote, timestamp: new Date() },
        ...state.emotes.slice(0, 19),
      ],
    })),

  movePlayer: (playerId, x, y) =>
    set((state) => ({
      // Simulated
    })),

  setPlayerArea: (playerId, area) =>
    set((state) => ({
      // Simulated
    })),

  resetGame: () => set(initialState),
}));
