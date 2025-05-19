import { create } from 'zustand';
import type { Question, TestResponse, User } from '../types';

interface EQStore {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Test
  currentQuestion: number;
  questions: Question[];
  responses: TestResponse[];
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (index: number) => void;
  addResponse: (response: TestResponse) => void;
  resetTest: () => void;

  // UI
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useStore = create<EQStore>((set) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // Test
  currentQuestion: 0,
  questions: [],
  responses: [],
  setQuestions: (questions) => set({ questions }),
  setCurrentQuestion: (index) => set({ currentQuestion: index }),
  addResponse: (response) => 
    set((state) => ({ 
      responses: [...state.responses, response]
    })),
  resetTest: () => set({ currentQuestion: 0, responses: [] }),

  // UI
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
})); 