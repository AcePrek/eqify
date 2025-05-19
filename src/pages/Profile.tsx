import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useStore();

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Please sign in to view your profile
        </h1>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 text-gray-900">{user.name || 'Not set'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 text-gray-900">{user.email}</div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test History</h2>
        {user.testHistory.length === 0 ? (
          <p className="text-gray-600">No tests taken yet</p>
        ) : (
          <div className="space-y-4">
            {user.testHistory.map((test) => (
              <div key={test.id} className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{test.label}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(test.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-lg font-semibold">
                    Score: {test.totalScore.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 