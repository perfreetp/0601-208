import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'text-gray-300 border-gray-400',
    rare: 'text-neon-cyan border-neon-cyan',
    epic: 'text-starlight-light border-starlight-light',
    legendary: 'text-gold-yellow border-gold-yellow',
  };
  return colors[rarity] || colors.common;
}

export function getRarityBg(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'bg-gray-500/20',
    rare: 'bg-neon-cyan/20',
    epic: 'bg-starlight-purple/20',
    legendary: 'bg-gold-yellow/20',
  };
  return colors[rarity] || colors.common;
}

export function getRarityText(rarity: string): string {
  const texts: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };
  return texts[rarity] || '普通';
}

export function getTaskTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    puzzle: '🧩',
    findItem: '🔍',
    vote: '🗳️',
    quiz: '❓',
  };
  return icons[type] || '🎯';
}

export function getTaskTypeName(type: string): string {
  const names: Record<string, string> = {
    puzzle: '拼图挑战',
    findItem: '寻物游戏',
    vote: '投票决策',
    quiz: '限时问答',
  };
  return names[type] || '未知任务';
}

export function getDifficultyStars(difficulty: number): string {
  return '⭐'.repeat(difficulty);
}

export function getAreaIcon(area: string): string {
  const icons: Record<string, string> = {
    lobby: '🏛️',
    island: '🏝️',
    tasks: '🎯',
    build: '🏗️',
    voice: '🎙️',
    map: '🗺️',
    replay: '🎬',
    host: '🎛️',
  };
  return icons[area] || '❓';
}

export function getAreaName(area: string): string {
  const names: Record<string, string> = {
    lobby: '大厅',
    island: '岛屿中心',
    tasks: '任务区',
    build: '建造区',
    voice: '语音区',
    map: '地图区',
    replay: '回放区',
    host: '主持区',
  };
  return names[area] || '未知区域';
}

export function getEmoteEmoji(emote: string): string {
  const emojis: Record<string, string> = {
    wave: '👋',
    clap: '👏',
    dance: '💃',
    like: '👍',
    celebrate: '🎉',
    think: '🤔',
  };
  return emojis[emote] || '😊';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}
