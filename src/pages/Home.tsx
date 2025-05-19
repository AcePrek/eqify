import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Discover Your Emotional Intelligence
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Take our scientifically validated EQ test to understand and improve your emotional intelligence.
      </p>
      <Link
        to="/test"
        className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700"
      >
        Start EQ Test
      </Link>
    </div>
  );
} 