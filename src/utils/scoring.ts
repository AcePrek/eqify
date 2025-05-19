import type { EQDimension, Question, TestResponse } from '../types';
import type { EQQuestion, EQResponse, EQResults } from '../types';

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

const calculateCategoryScore = (
  responses: EQResponse[],
  questions: EQQuestion[],
  category: EQQuestion['category']
): number => {
  console.log(`\nCalculating score for category: ${category}`);
  const categoryQuestions = questions.filter((q) => q.category === category);
  console.log('Questions for category:', categoryQuestions);
  
  const categoryResponses = responses.filter((r) =>
    categoryQuestions.some((q) => q.id === r.questionId)
  );
  console.log('Responses for category:', categoryResponses);

  if (categoryResponses.length === 0) {
    console.log('No responses found for category');
    return 0;
  }

  const total = categoryResponses.reduce((sum, response) => {
    const question = questions.find((q) => q.id === response.questionId);
    if (!question) {
      console.log('Question not found for response:', response);
      return sum;
    }

    // For reverse scored questions, invert the score (1 becomes 5, 2 becomes 4, etc.)
    const score = question.reverse_scored
      ? 6 - response.response
      : response.response;

    console.log(`Response for question "${question.text}":`, {
      questionId: response.questionId,
      originalResponse: response.response,
      reverseScored: question.reverse_scored,
      finalScore: score
    });

    return sum + score;
  }, 0);

  const maxPossibleScore = categoryResponses.length * 5;
  const finalScore = (total / maxPossibleScore) * 100;
  
  console.log('Category score calculation:', {
    category,
    total,
    responses: categoryResponses.length,
    maxPossibleScore,
    finalScore
  });

  return finalScore;
};

export const calculateEQScores = (
  responses: EQResponse[],
  questions: EQQuestion[]
): EQResults => {
  console.log('\nCalculating EQ scores');
  console.log('Total responses:', responses?.length);
  console.log('Total questions:', questions?.length);
  console.log('Response data:', responses);
  console.log('Questions data:', questions);

  const categories = {
    self_awareness: calculateCategoryScore(responses, questions, 'self_awareness'),
    self_management: calculateCategoryScore(responses, questions, 'self_management'),
    social_awareness: calculateCategoryScore(responses, questions, 'social_awareness'),
    relationship_management: calculateCategoryScore(
      responses,
      questions,
      'relationship_management'
    ),
  };

  const categoryScores = Object.values(categories);
  const validScores = categoryScores.filter(score => score > 0);
  const overall = validScores.length > 0
    ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    : 0;

  console.log('Final calculation:', {
    categories,
    categoryScores,
    validScores,
    overall
  });

  return {
    overall,
    categories,
  };
}; 