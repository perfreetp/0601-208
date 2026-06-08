export type GameArea = 
  | 'lobby' 
  | 'island' 
  | 'tasks' 
  | 'build' 
  | 'voice' 
  | 'map' 
  | 'replay' 
  | 'host';

export type RoomStatus = 'waiting' | 'playing' | 'paused' | 'ended';
export type GameMode = 'coop' | 'competitive' | 'mixed';
export type TaskType = 'puzzle' | 'findItem' | 'vote' | 'quiz';
export type TaskStatus = 'locked' | 'available' | 'inProgress' | 'completed';
export type TaskDifficulty = 1 | 2 | 3;
export type BuildingCategory = 'decoration' | 'landmark' | 'functional';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type HighlightType = 'taskComplete' | 'achievement' | 'teamWork' | 'funnyMoment';
export type EmoteType = 'wave' | 'clap' | 'dance' | 'like' | 'celebrate' | 'think';

export type EventLogType = 
  | 'taskStart'      // 任务开始
  | 'taskComplete'   // 任务完成
  | 'itemFound'      // 找到隐藏物品
  | 'puzzlePlaced'   // 放置拼图块
  | 'quizAnswered'   // 回答问答题目
  | 'voteCast'       // 投票
  | 'buildingPlaced' // 建筑放置
  | 'buildingMoved'  // 建筑移动
  | 'buildingUndo'   // 建筑撤回
  | 'hostHint'       // 主持人提示
  | 'gamePause'      // 游戏暂停
  | 'gameResume';    // 游戏继续

export interface Team {
  id: string;
  name: string;
  color: string;
  captainId?: string;
}

export interface Player {
  id: string;
  name: string;
  avatarId: string;
  avatarEmoji: string;
  color: string;
  isHost: boolean;
  teamId: string;
  position: { x: number; y: number };
  currentArea: GameArea;
  isMuted: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  score: number;
  isTeamCaptain?: boolean;
  currentEmote?: EmoteType;
}

export interface Room {
  id: string;
  roomCode: string;
  status: RoomStatus;
  maxPlayers: number;
  gameMode: GameMode;
  players: Player[];
  totalScore: number;
  createdAt: Date;
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  points: number;
  status: TaskStatus;
  timeLimit: number;
  progress?: number;
  participants?: string[];   // 参与玩家ID列表
  lastScoreRecord?: {        // 最近一次得分记录
    playerId: string;
    points: number;
    timestamp: Date;
  };
  remainingTarget?: number;  // 剩余目标（如剩余拼图块、剩余物品数）
}

export interface RecipeItem {
  itemId: string;
  count: number;
}

export interface BuildingItem {
  id: string;
  name: string;
  category: BuildingCategory;
  icon: string;
  description: string;
  position?: { x: number; y: number };
  rotation?: number;
  scale?: number;
  placed: boolean;
  unlocked: boolean;
  recipe?: RecipeItem[];
  placedBy?: string;       // 放置者玩家ID
  placedAt?: Date;         // 放置时间
  confirmed?: boolean;     // 是否已确认（false时可撤回）
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
}

export interface Highlight {
  id: string;
  timestamp: Date;
  type: HighlightType;
  description: string;
  playerIds: string[];
  points?: number;
  area?: GameArea;         // 发生的区域
  scoreDelta?: number;     // 积分变化
  teamScoreAfter?: number; // 事件后团队积分
}

export interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

export interface VoteTopic {
  id: string;
  title: string;
  options: VoteOption[];
  totalVotes: number;
  votedPlayerIds: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
  category: string;
}

export interface PuzzlePiece {
  id: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  isPlaced: boolean;
}

export interface HiddenItem {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  found: boolean;
  foundBy?: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  timestamp: Date;
  system?: boolean;
}

export interface Material {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface EventLog {
  id: string;
  timestamp: Date;
  type: EventLogType;
  description: string;
  playerId?: string;      // 触发事件的玩家ID
  playerIds?: string[];   // 关联的所有玩家ID
  area?: GameArea;        // 发生的区域
  taskId?: string;        // 关联任务ID
  buildingId?: string;    // 关联建筑ID
  scoreDelta?: number;    // 团队积分变化（正负）
  teamScoreAfter?: number;// 事件后的团队积分
  extra?: Record<string, any>;
}

export interface GameState {
  currentArea: GameArea;
  isPaused: boolean;
  gameTime: number;
  tasks: Task[];
  completedTasks: string[];
  buildings: BuildingItem[];
  achievements: Achievement[];
  highlights: Highlight[];
  currentTaskId: string | null;
  currentTask: Task | null;
  teamScore: number;
  messages: ChatMessage[];
  voteTopics: VoteTopic[];
  materials: Material[];
  quizQuestions: QuizQuestion[];
  currentQuizIndex: number;
  hiddenItems: HiddenItem[];
  puzzlePieces: PuzzlePiece[];
  emotes: { playerId: string; emote: EmoteType; timestamp: Date }[];
  eventLogs: EventLog[];
  teams: Team[];
}

export interface AreaInfo {
  id: GameArea;
  name: string;
  description: string;
  icon: string;
  color: string;
  position: { x: number; y: number };
}
