import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';
import { calculateEQScores } from '../utils/scoring';
import type { TestSession, EQQuestion, EQResults } from '../types';

interface SessionWithResults extends TestSession {
  results: EQResults;
}

interface ChartDataItem {
  category: string;
  value: number;
  fullName: string;
}

export default function Results() {
  const navigate = useNavigate();
  const { auth, setTestError } = useStore();
  const [sessions, setSessions] = useState<SessionWithResults[]>([]);
  const [questions, setQuestions] = useState<EQQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.user;
    if (!user) {
      navigate('/');
      return;
    }

    const fetchResults = async () => {
      try {
        // Fetch questions first
        const { data: questionsData, error: questionsError } = await supabase
          .from('eq_questions')
          .select('*');

        if (questionsError) throw questionsError;
        console.log('Questions from DB:', questionsData);
        setQuestions(questionsData);

        // Fetch user's test sessions with type assertion
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('eq_test_sessions')
          .select(`
            id,
            user_id,
            created_at,
            completed_at,
            eq_responses (
              id,
              question_id,
              response
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (sessionsError) throw sessionsError;
        console.log('Raw sessions data:', sessionsData);

        // Calculate results for each session
        const sessionsWithResults = sessionsData.map((session: any) => {
          console.log('\nProcessing session:', session.id);
          console.log('Session responses:', session.eq_responses);
          
          if (!session.eq_responses || session.eq_responses.length === 0) {
            console.log('No responses found for session');
            return {
              id: session.id,
              userId: session.user_id,
              createdAt: session.created_at,
              completedAt: session.completed_at,
              responses: [],
              results: {
                overall: 0,
                categories: {
                  self_awareness: 0,
                  self_management: 0,
                  social_awareness: 0,
                  relationship_management: 0,
                }
              }
            };
          }

          // Map responses to the correct format
          const formattedResponses = session.eq_responses.map((r: any) => ({
            questionId: r.question_id,
            response: r.response
          }));
          console.log('Formatted responses:', formattedResponses);

          const results = calculateEQScores(formattedResponses, questionsData);
          console.log('Calculated results:', results);

          return {
            id: session.id,
            userId: session.user_id,
            createdAt: session.created_at,
            completedAt: session.completed_at,
            responses: formattedResponses,
            results: results,
          };
        });

        console.log('Final sessions with results:', sessionsWithResults);
        setSessions(sessionsWithResults);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchResults:', error);
        setTestError(error instanceof Error ? error.message : 'Failed to load results');
        setLoading(false);
      }
    };

    fetchResults();
  }, [auth.user, navigate, setTestError]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <h2 className="text-2xl font-semibold mb-4">No Results Yet</h2>
          <p className="text-gray-600 mb-8">
            You haven't taken any EQ tests yet. Take your first test to see your results!
          </p>
          <button onClick={() => navigate('/test')} className="btn btn-primary">
            Take EQ Test
          </button>
        </div>
      </div>
    );
  }

  const latestSession = sessions[0];
  console.log('Latest session results:', latestSession.results);
  
  const chartData: ChartDataItem[] = [
    {
      category: 'Self\nAwareness',
      value: latestSession.results.categories.self_awareness,
      fullName: 'Self Awareness'
    },
    {
      category: 'Self\nManagement',
      value: latestSession.results.categories.self_management,
      fullName: 'Self Management'
    },
    {
      category: 'Social\nAwareness',
      value: latestSession.results.categories.social_awareness,
      fullName: 'Social Awareness'
    },
    {
      category: 'Relationship\nManagement',
      value: latestSession.results.categories.relationship_management,
      fullName: 'Relationship Management'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-2">Your Latest EQ Results</h2>
        <p className="text-gray-600 mb-6">
          Test completed on{' '}
          {new Date(latestSession.completedAt || latestSession.createdAt).toLocaleDateString()}
        </p>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium">Overall EQ Score</span>
            <span className="text-2xl font-bold text-primary">
              {Math.round(latestSession.results.overall)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary rounded-full h-3"
              style={{ width: `${latestSession.results.overall}%` }}
            />
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} className="mx-auto">
              <PolarGrid />
              <PolarAngleAxis
                dataKey="category"
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={16}
                      textAnchor="middle"
                      fill="#4B5563"
                      fontSize={12}
                      fontWeight={500}
                    >
                      {payload.value.split('\n').map((line: string, i: number) => (
                        <tspan x="0" dy={i === 0 ? "0" : "1.2em"} key={i}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                )}
              />
              <Radar
                name="EQ Score"
                dataKey="value"
                stroke="#4F46E5"
                fill="#4F46E5"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          {chartData.map((item) => (
            <div key={item.fullName} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">{item.fullName}</h3>
              <div className="mt-2 flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {Math.round(item.value)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sessions.length > 1 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Previous Results</h3>
          <div className="space-y-4">
            {sessions.slice(1).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    Test on{' '}
                    {new Date(
                      session.completedAt || session.createdAt
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Overall Score: {Math.round(session.results.overall)}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/results/${session.id}`)}
                  className="btn btn-secondary"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 