import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { calculateDimensionScore, calculateTotalScore, determineEQLabel } from '../utils/scoring';
import type { EQDimension } from '../types';

export default function Results() {
  const navigate = useNavigate();
  const { questions, responses } = useStore();
  const [dimensionScores, setDimensionScores] = useState<Record<EQDimension, number>>({
    'Self-Awareness': 0,
    'Self-Regulation': 0,
    'Motivation': 0,
    'Empathy': 0,
    'Social Skills': 0
  });

  useEffect(() => {
    if (!responses.length) {
      navigate('/test');
      return;
    }

    const scores = {
      'Self-Awareness': calculateDimensionScore(responses, questions, 'Self-Awareness'),
      'Self-Regulation': calculateDimensionScore(responses, questions, 'Self-Regulation'),
      'Motivation': calculateDimensionScore(responses, questions, 'Motivation'),
      'Empathy': calculateDimensionScore(responses, questions, 'Empathy'),
      'Social Skills': calculateDimensionScore(responses, questions, 'Social Skills')
    };

    setDimensionScores(scores);
  }, [responses, questions, navigate]);

  const totalScore = calculateTotalScore(dimensionScores);
  const label = determineEQLabel(dimensionScores);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your EQ Results</h1>
        <p className="text-xl text-gray-600">You are an {label}</p>
        <div className="mt-4 text-2xl font-semibold">
          Total EQ Score: {totalScore.toFixed(1)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(dimensionScores).map(([dimension, score]) => (
          <div key={dimension} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">{dimension}</h3>
            <div className="h-4 bg-gray-200 rounded-full">
              <div
                className="h-4 bg-indigo-600 rounded-full"
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Score: {score.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => navigate('/test')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Take Test Again
        </button>
      </div>
    </div>
  );
} 