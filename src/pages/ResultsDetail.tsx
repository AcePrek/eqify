import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { supabase } from '../lib/supabase';
import { calculateEQScores } from '../utils/scoring';
import type { EQQuestion, EQResponse, EQResults } from '../types';

export default function ResultsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<EQQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('eq_questions')
          .select('*');
        if (questionsError) throw questionsError;
        setQuestions(questionsData);

        const { data: sessionData, error: sessionError } = await supabase
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
          .eq('id', id)
          .single();
        if (sessionError) throw sessionError;
        if (!sessionData) throw new Error('Session not found');

        const formattedResponses = (sessionData.eq_responses || []).map((r: any) => ({
          questionId: r.question_id,
          response: r.response
        }));
        const results = calculateEQScores(formattedResponses, questionsData);
        setSession({ ...sessionData, responses: formattedResponses, results });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        navigate('/results');
      }
    };
    fetchSession();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!session) return null;

  const chartData = [
    {
      category: 'Self\nAwareness',
      value: session.results.categories.self_awareness,
      fullName: 'Self Awareness',
    },
    {
      category: 'Self\nManagement',
      value: session.results.categories.self_management,
      fullName: 'Self Management',
    },
    {
      category: 'Social\nAwareness',
      value: session.results.categories.social_awareness,
      fullName: 'Social Awareness',
    },
    {
      category: 'Relationship\nManagement',
      value: session.results.categories.relationship_management,
      fullName: 'Relationship Management',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-2">EQ Test Details</h2>
        <p className="text-gray-600 mb-6">
          Test completed on{' '}
          {new Date(session.completed_at || session.created_at).toLocaleDateString()}
        </p>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium">Overall EQ Score</span>
            <span className="text-2xl font-bold text-primary">
              {Math.round(session.results.overall)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary rounded-full h-3"
              style={{ width: `${session.results.overall}%` }}
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
                        <tspan x="0" dy={i === 0 ? '0' : '1.2em'} key={i}>
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
    </div>
  );
} 