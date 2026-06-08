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
  EventLog,
  EventLogType,
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

const STORAGE_KEY = 'metaverse-island-state-v1';

function loadState(): Partial<GameState> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    ['timestamp', 'placedAt', 'unlockedAt'].forEach(key => {
      parsed.highlights?.forEach?.((h: any) => { if (h[key]) h[key] = new Date(h[key]); });
      parsed.eventLogs?.forEach?.((e: any) => { if (e[key]) e[key] = new Date(e[key]); });
      parsed.achievements?.forEach?.((a: any) => { if (a[key]) a[key] = new Date(a[key]); });
      parsed.messages?.forEach?.((m: any) => { if (m[key]) m[key] = new Date(m[key]); });
      parsed.buildings?.forEach?.((b: any) => { if (b[key]) b[key] = new Date(b[key]); });
      parsed.tasks?.forEach?.((t: any) => { if (t.lastScoreRecord?.timestamp) t.lastScoreRecord.timestamp = new Date(t.lastScoreRecord.timestamp); });
    });
    return parsed;
  } catch { return null; }
}

interface GameStore extends GameState {
  setCurrentArea: (area: GameArea) => void;
  togglePause: () => void;
  setPaused: (paused: boolean) => void;
  addScore: (points: number, playerId?: string) => void;
  updateTaskStatus: (taskId: string, status: Task['status'], progress?: number) => void;
  completeTask: (taskId: string) => void;
  placeBuilding: (buildingId: string, x: number, y: number) => void;
  moveBuilding: (buildingId: string, x: number, y: number) => void;
  undoBuilding: (buildingId: string) => void;
  confirmBuilding: (buildingId: string) => void;
  unlockBuilding: (buildingId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  addHighlight: (highlight: Omit<Highlight, 'id' | 'timestamp'>) => void;
  addEventLog: (event: Omit<EventLog, 'id' | 'timestamp'>) => void;
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
  resetGameState: () => void;
}

const originalInitialState: GameState = {
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
  eventLogs: [],
};

const savedState = loadState();
const initialState: GameState = {
  ...originalInitialState,
  ...(savedState || {}),
  eventLogs: savedState?.eventLogs || [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setCurrentArea: (area) => set({ currentArea: area }),

  togglePause: () => {
    const state = get();
    const newPaused = !state.isPaused;
    set({ isPaused: newPaused });
    get().addEventLog({
      type: newPaused ? 'gamePause' : 'gameResume',
      description: newPaused ? '游戏已暂停' : '游戏已继续',
      playerId: 'p1',
      area: 'host',
    });
  },

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
    if (state.completedTasks.includes(taskId)) return;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentScore = get().teamScore;
    
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t
      ),
      completedTasks: [...s.completedTasks, taskId],
      teamScore: s.teamScore + task.points,
      currentTask: null,
      currentTaskId: null,
      achievements: s.achievements.map((a) => {
        if (a.id === 'a3' && task.type === 'puzzle') {
          const newProgress = (a.progress || 0) + 1;
          return { ...a, progress: newProgress, unlocked: newProgress >= (a.target || 0) };
        }
        return a;
      }),
    }));

    get().addEventLog({
      type: 'taskComplete',
      description: `团队成功完成「${task.title}」挑战！`,
      playerIds: MOCK_PLAYERS.map(p => p.id),
      area: 'tasks',
      taskId,
      scoreDelta: task.points,
      teamScoreAfter: currentScore + task.points,
    });

    get().addHighlight({
      type: 'taskComplete',
      description: `🎉 团队成功完成「${task.title}」挑战！`,
      playerIds: MOCK_PLAYERS.map(p => p.id),
      points: task.points,
      area: 'tasks',
      scoreDelta: task.points,
      teamScoreAfter: currentScore + task.points,
    });

    get().addSystemMessage(`任务「${task.title}」完成！获得 ${task.points} 团队积分`);
  },

  placeBuilding: (buildingId, x, y) => {
    const state = get();
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building) return;

    set((s) => ({
      buildings: s.buildings.map((b) =>
        b.id === buildingId ? { ...b, placed: true, position: { x, y }, placedBy: 'p1', placedAt: new Date(), confirmed: false } : b
      ),
      achievements: s.achievements.map((a) => {
        if (a.id === 'a5') {
          const newProgress = (a.progress || 0) + 1;
          return { ...a, progress: newProgress, unlocked: newProgress >= (a.target || 0) };
        }
        return a;
      }),
    }));

    get().addEventLog({
      type: 'buildingPlaced',
      description: `放置了建筑「${building.name}」`,
      playerId: 'p1',
      area: 'build',
      buildingId,
    });
  },

  moveBuilding: (buildingId, x, y) => {
    const state = get();
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building) return;

    set((s) => ({
      buildings: s.buildings.map((b) =>
        b.id === buildingId ? { ...b, position: { x, y }, confirmed: false } : b
      ),
    }));

    get().addEventLog({
      type: 'buildingMoved',
      description: `移动了建筑「${building.name}」`,
      playerId: 'p1',
      area: 'build',
      buildingId,
    });
  },

  undoBuilding: (buildingId) => {
    const state = get();
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building || !building.placed) return;

    set((s) => ({
      buildings: s.buildings.map((b) =>
        b.id === buildingId ? { ...b, placed: false, position: undefined, placedBy: undefined, placedAt: undefined, confirmed: undefined } : b
      ),
      achievements: s.achievements.map((a) => {
        if (a.id === 'a5' && a.progress && a.progress > 0) {
          const newProgress = a.progress - 1;
          return { ...a, progress: newProgress, unlocked: newProgress >= (a.target || 0) };
        }
        return a;
      }),
    }));

    get().addEventLog({
      type: 'buildingUndo',
      description: `撤回了建筑「${building.name}」`,
      playerId: 'p1',
      area: 'build',
      buildingId,
    });
  },

  confirmBuilding: (buildingId) =>
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === buildingId ? { ...b, confirmed: true } : b
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

  addEventLog: (event) =>
    set((state) => ({
      eventLogs: [
        {
          ...event,
          id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: new Date(),
        },
        ...state.eventLogs,
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

  castVote: (topicId, optionId) => {
    const state = get();
    const topic = state.voteTopics.find(t => t.id === topicId);
    const option = topic?.options.find(o => o.id === optionId);

    set((s) => ({
      voteTopics: s.voteTopics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              totalVotes: t.totalVotes + 1,
              options: t.options.map((opt) =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
              ),
            }
          : t
      ),
    }));

    get().addEventLog({
      type: 'voteCast',
      description: `投票选择了「${option?.text || '某个选项'}」`,
      playerId: 'p1',
      area: 'tasks',
    });

    const voteTask = get().tasks.find(t => t.type === 'vote' && t.status !== 'completed');
    if (voteTask) {
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === voteTask.id
            ? {
                ...t,
                participants: t.participants?.includes('p1') ? t.participants : [...(t.participants || []), 'p1'],
                lastScoreRecord: {
                  playerId: 'p1',
                  points: 0,
                  timestamp: new Date(),
                },
              }
            : t
        ),
      }));
    }
  },

  answerQuiz: (questionIndex, answer) => {
    const state = get();
    const question = state.quizQuestions[questionIndex];
    if (!question) return { correct: false, points: 0 };

    const correct = answer === question.correctAnswer;
    const points = correct ? question.points : 0;
    const currentScore = get().teamScore;

    if (correct) {
      get().addScore(question.points);
    }

    get().addEventLog({
      type: 'quizAnswered',
      description: correct ? `答对了题目「${question.question}」` : `答错了题目「${question.question}」`,
      playerId: 'p1',
      area: 'tasks',
      scoreDelta: points,
      teamScoreAfter: currentScore + points,
    });

    return { correct, points };
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
      area: 'host',
    });
    get().addEventLog({
      type: 'hostHint',
      description: `主持人提示：${content}`,
      playerId: 'p1',
      area: 'host',
    });
  },

  findHiddenItem: (itemId, playerId) => {
    const state = get();
    const item = state.hiddenItems.find(i => i.id === itemId);
    if (!item || item.found) return;

    const currentScore = get().teamScore;
    const points = 15;

    set((s) => ({
      hiddenItems: s.hiddenItems.map((i) =>
        i.id === itemId ? { ...i, found: true, foundBy: playerId } : i
      ),
      teamScore: s.teamScore + points,
      tasks: s.tasks.map((t) => {
        if (t.type === 'findItem' && t.status !== 'completed') {
          const remaining = (t.remainingTarget ?? s.hiddenItems.filter(h => !h.found).length) - 1;
          return {
            ...t,
            participants: t.participants?.includes(playerId) ? t.participants : [...(t.participants || []), playerId],
            lastScoreRecord: {
              playerId,
              points,
              timestamp: new Date(),
            },
            remainingTarget: Math.max(0, remaining),
          };
        }
        return t;
      }),
      achievements: s.achievements.map((a) => {
        if (a.id === 'a4') {
          const foundCount = s.hiddenItems.filter(h => h.found || h.id === itemId).length;
          return { ...a, progress: foundCount, unlocked: foundCount >= (a.target || 0) };
        }
        return a;
      }),
    }));

    get().addEventLog({
      type: 'itemFound',
      description: `找到了隐藏物品「${item.name}」`,
      playerId,
      area: 'tasks',
      scoreDelta: points,
      teamScoreAfter: currentScore + points,
    });

    const player = MOCK_PLAYERS.find(p => p.id === playerId);
    get().addSystemMessage(`${player?.name || '某玩家'} 找到了 ${item.name}！+15分`);
  },

  placePuzzlePiece: (pieceId, x, y) => {
    const state = get();
    const piece = state.puzzlePieces.find(p => p.id === pieceId);
    if (!piece || piece.isPlaced) return;

    set((s) => ({
      puzzlePieces: s.puzzlePieces.map((p) =>
        p.id === pieceId ? { ...p, currentX: x, currentY: y, isPlaced: true } : p
      ),
      tasks: s.tasks.map((t) => {
        if (t.type === 'puzzle' && t.status !== 'completed') {
          const placedCount = s.puzzlePieces.filter(p => p.isPlaced || p.id === pieceId).length;
          const remaining = s.puzzlePieces.length - placedCount;
          return {
            ...t,
            participants: t.participants?.includes('p1') ? t.participants : [...(t.participants || []), 'p1'],
            lastScoreRecord: {
              playerId: 'p1',
              points: 0,
              timestamp: new Date(),
            },
            remainingTarget: Math.max(0, remaining),
          };
        }
        return t;
      }),
    }));

    get().addEventLog({
      type: 'puzzlePlaced',
      description: `放置了拼图块 #${pieceId}`,
      playerId: 'p1',
      area: 'tasks',
    });
  },

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

  resetGameState: () => {
    localStorage.removeItem(STORAGE_KEY);
    set(originalInitialState);
  },
}));

useGameStore.subscribe((state) => {
  try {
    const toSave: Partial<GameState> = {
      currentArea: state.currentArea,
      isPaused: state.isPaused,
      gameTime: state.gameTime,
      tasks: state.tasks,
      completedTasks: state.completedTasks,
      buildings: state.buildings,
      achievements: state.achievements,
      highlights: state.highlights,
      teamScore: state.teamScore,
      messages: state.messages,
      voteTopics: state.voteTopics,
      materials: state.materials,
      currentQuizIndex: state.currentQuizIndex,
      hiddenItems: state.hiddenItems,
      puzzlePieces: state.puzzlePieces,
      eventLogs: state.eventLogs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
});
