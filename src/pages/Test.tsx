import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';
import type { EQQuestion, EQResponse } from '../types';

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export default function Test() {
  const navigate = useNavigate();
  const {
    auth,
    test,
    initializeTest,
    setCurrentSession,
    updateResponse,
    nextQuestion,
    setTestError,
  } = useStore();

  useEffect(() => {
    if (!auth.user) {
      navigate('/');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('eq_questions')
          .select('*')
          .order('id');
        
        if (error) throw error;
        
        console.log('Fetched questions:', data);
        initializeTest(data as EQQuestion[]);
        
        const { data: sessionData, error: sessionError } = await supabase
          .from('eq_test_sessions')
          .insert({ user_id: auth.user!.id })
          .select()
          .single();
        
        if (sessionError) throw sessionError;
        
        console.log('Created test session:', sessionData);
        setCurrentSession({
          id: sessionData.id,
          userId: sessionData.user_id,
          createdAt: sessionData.created_at,
          responses: [],
        });
      } catch (error) {
        console.error('Error in fetchQuestions:', error);
        setTestError(error instanceof Error ? error.message : 'Failed to load test');
      }
    };

    fetchQuestions();
  }, [auth.user, navigate]);

  const handleResponse = async (value: number) => {
    if (!test.currentSession || !test.questions[test.currentQuestionIndex]) return;

    const currentQuestion = test.questions[test.currentQuestionIndex];
    console.log('Current question:', currentQuestion);

    const response: EQResponse = {
      questionId: currentQuestion.id,
      response: value,
    };

    console.log('Saving response:', {
      session_id: test.currentSession.id,
      question_id: response.questionId,
      response: response.response,
    });

    try {
      const { data, error } = await supabase.from('eq_responses').insert({
        session_id: test.currentSession.id,
        question_id: response.questionId,
        response: response.response,
      }).select();

      if (error) throw error;

      console.log('Saved response:', data);
      updateResponse(response);

      if (test.currentQuestionIndex === test.questions.length - 1) {
        // Test completed
        console.log('Test completed, updating session');
        const { error: sessionError } = await supabase
          .from('eq_test_sessions')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', test.currentSession.id);

        if (sessionError) {
          console.error('Error updating session:', sessionError);
          throw sessionError;
        }

        navigate('/results');
      } else {
        nextQuestion();
      }
    } catch (error) {
      console.error('Error saving response:', error);
      setTestError(error instanceof Error ? error.message : 'Failed to save response');
    }
  };

  if (!test.questions.length || !test.currentSession) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentQuestion = test.questions[test.currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Question {test.currentQuestionIndex + 1} of {test.questions.length}
            </h2>
            <span className="text-sm text-gray-500">
              {Math.round((test.currentQuestionIndex / test.questions.length) * 100)}%
              Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{
                width: `${(test.currentQuestionIndex / test.questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <h3 className="text-xl font-medium text-gray-800 mb-8">{currentQuestion.text}</h3>

        <div className="space-y-3">
          {LIKERT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleResponse(option.value)}
              className="w-full text-left p-4 rounded-lg bg-white border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                {option.value}
              </div>
              <span className="text-gray-700 font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        {test.error && (
          <div className="mt-4 p-4 bg-error/10 text-error rounded-lg">
            {test.error}
          </div>
        )}
      </div>
    </div>
  );
} 