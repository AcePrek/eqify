export type EQDimension = 'Self-Awareness' | 'Self-Regulation' | 'Motivation' | 'Empathy' | 'Social Skills';

export interface Question {
  id: number;
  dimension: EQDimension;
  question: string;
}

export interface TestResponse {
  questionId: number;
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
  name?: string;
  testHistory: TestResult[];
} 