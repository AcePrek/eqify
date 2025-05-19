# EQify - Emotional Intelligence Assessment Platform

EQify is a web application that helps users assess and understand their Emotional Intelligence (EQ) through a scientifically validated test based on Daniel Goleman's model.

## Features

- Scientifically validated EQ test
- Real-time scoring and analysis
- Personalized insights and recommendations
- User profiles with test history
- Beautiful and intuitive UI

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Backend & Authentication)
- React Router
- Zustand (State Management)
- Recharts (Data Visualization)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/eqify.git
   cd eqify
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Create the following tables in your Supabase project:
   - users
   - eq_questions
   - eq_results
   - eq_test_sessions

2. Set up the appropriate RLS policies for each table.

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── store/         # Zustand store
  ├── types/         # TypeScript types
  ├── utils/         # Utility functions
  ├── lib/           # External service configurations
  └── App.tsx        # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
