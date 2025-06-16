
// src/types/todo.ts

export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  points: number; // XP for completing the task
  category?: string; // Optional category
  createdAt: string; // ISO date string
  completedAt?: string; // ISO date string
}
