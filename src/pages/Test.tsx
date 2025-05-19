import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function Test() {
  const navigate = useNavigate();
  const { 
    currentQuestion,
    questions,
    responses,
    setCurrentQuestion,
    addResponse,
    isLoading,
    error 
  } = useStore();

  useEffect(() => {
    // TODO: Load questions from Supabase
  }, []);

  const handleResponse = (value: number) => {
    if (currentQuestion >= questions.length) return;

    addResponse({
      questionId: questions[currentQuestion].id,
      response: value
    });

    if (currentQuestion === questions.length - 1) {
      navigate('/results');
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!questions.length) {
    return <div>No questions available</div>;
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-gray-500 mb-2">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-indigo-600 rounded-full"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-8">{currentQ.question}</h2>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleResponse(value)}
            className="w-full text-left p-4 border rounded-lg hover:bg-gray-50"
          >
            {value === 1 && 'Strongly Disagree'}
            {value === 2 && 'Disagree'}
            {value === 3 && 'Neutral'}
            {value === 4 && 'Agree'}
            {value === 5 && 'Strongly Agree'}
          </button>
        ))}
      </div>
    </div>
  );
} 