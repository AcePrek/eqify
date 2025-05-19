import { create } from 'zustand';
import type { AuthState, TestState, User, EQQuestion, TestSession, EQResponse } from '../types';
import { supabase } from '../lib/supabase';

interface Store {
  auth: AuthState;
  test: TestState;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  initializeTest: (questions: EQQuestion[]) => void;
  setCurrentSession: (session: TestSession | null) => void;
  updateResponse: (response: EQResponse) => void;
  nextQuestion: () => void;
  setTestError: (error: string | null) => void;
}

export const useStore = create<Store>((set) => ({
  auth: {
    user: null,
    loading: true,
    error: null,
  },
  test: {
    currentSession: null,
    currentQuestionIndex: 0,
    questions: [],
    loading: false,
    error: null,
  },
  setUser: (user) => set((state) => ({ auth: { ...state.auth, user } })),
  setAuthLoading: (loading) => set((state) => ({ auth: { ...state.auth, loading } })),
  setAuthError: (error) => set((state) => ({ auth: { ...state.auth, error } })),
  initializeTest: (questions) =>
    set((state) => ({
      test: {
        ...state.test,
        questions,
        currentQuestionIndex: 0,
        loading: false,
      },
    })),
  setCurrentSession: (session) =>
    set((state) => ({
      test: {
        ...state.test,
        currentSession: session,
      },
    })),
  updateResponse: (response) =>
    set((state) => {
      if (!state.test.currentSession) return state;
      return {
        test: {
          ...state.test,
          currentSession: {
            ...state.test.currentSession,
            responses: [
              ...state.test.currentSession.responses.filter(
                (r) => r.questionId !== response.questionId
              ),
              response,
            ],
          },
        },
      };
    }),
  nextQuestion: () =>
    set((state) => ({
      test: {
        ...state.test,
        currentQuestionIndex: Math.min(
          state.test.currentQuestionIndex + 1,
          state.test.questions.length - 1
        ),
      },
    })),
  setTestError: (error) =>
    set((state) => ({
      test: {
        ...state.test,
        error,
      },
    })),
})); 