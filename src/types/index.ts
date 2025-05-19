export type EQDimension = 'Self-Awareness' | 'Self-Regulation' | 'Motivation' | 'Empathy' | 'Social Skills';

export interface Question {
  id: string;
  dimension: EQDimension;
  question: string;
}

export interface TestResponse {
  questionId: string;
  response: number; // 1-5 Likert scale
}

export interface TestResult {
  id: string;
  userId: string;
  date: string;
  responses: TestResponse[];
  dimensionScores: Record<EQDimension, number>;
  totalScore: number;
  label: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface EQQuestion {
  id: string;
  category: 'self_awareness' | 'self_management' | 'social_awareness' | 'relationship_management';
  text: string;
  reverse_scored?: boolean;
}

export interface EQResponse {
  questionId: string;
  response: number; // 1-5 Likert scale
}

export interface TestSession {
  id: string;
  userId: string;
  createdAt: string;
  completedAt?: string;
  responses: EQResponse[];
}

export interface EQResults {
  overall: number;
  categories: {
    self_awareness: number;
    self_management: number;
    social_awareness: number;
    relationship_management: number;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface TestState {
  currentSession: TestSession | null;
  currentQuestionIndex: number;
  questions: EQQuestion[];
  loading: boolean;
  error: string | null;
} 