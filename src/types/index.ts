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
}

export interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

export interface VoteTopic {
  id: string;
  question: string;
  options: VoteOption[];
  isAnonymous: boolean;
  totalVotes: number;
  endTime?: Date;
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
}

export interface AreaInfo {
  id: GameArea;
  name: string;
  description: string;
  icon: string;
  color: string;
  position: { x: number; y: number };
}
