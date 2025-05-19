import type { EQDimension, Question, TestResponse } from '../types';

// Calculate normalized score for a dimension
export const calculateDimensionScore = (
  responses: TestResponse[],
  questions: Question[],
  dimension: EQDimension
): number => {
  const dimensionQuestions = questions.filter(q => q.dimension === dimension);
  const dimensionResponses = responses.filter(r => 
    dimensionQuestions.some(q => q.id === r.questionId)
  );

  if (dimensionResponses.length === 0) return 0;

  const rawScore = dimensionResponses.reduce((sum, r) => sum + r.response, 0);
  return ((rawScore - 10) / 40) * 100;
};

// Calculate total EQ score
export const calculateTotalScore = (dimensionScores: Record<EQDimension, number>): number => {
  const scores = Object.values(dimensionScores);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

// Determine EQ label based on dimension scores
export const determineEQLabel = (dimensionScores: Record<EQDimension, number>): string => {
  const highestDimension = Object.entries(dimensionScores).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0] as EQDimension;

  const labels: Record<EQDimension, string> = {
    'Self-Awareness': 'Introspective Leader',
    'Self-Regulation': 'Composed Strategist',
    'Motivation': 'Driven Achiever',
    'Empathy': 'Empathetic Connector',
    'Social Skills': 'Social Catalyst'
  };

  return labels[highestDimension];
}; 