import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

interface QuestionData {
  id: number;
  dimension: string;
  question: string;
  explanation?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const questions = JSON.parse(
  readFileSync(join(__dirname, '..', 'eq_question_bank.json'), 'utf-8')
) as QuestionData[];

const supabaseUrl = 'https://ajyezufpemjpmrjkqest.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeWV6dWZwZW1qcG1yamtxZXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzY0MzMsImV4cCI6MjA2MzI1MjQzM30.ChsAcGOvJ0XI4-_QKVfd64lChAgunNnRne_Z6dS1d-M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to convert dimension to category
function dimensionToCategory(dimension: string): string {
  const mapping: { [key: string]: string } = {
    'Self-Awareness': 'self_awareness',
    'Self-Regulation': 'self_management',
    'Motivation': 'self_management', // Part of self-management
    'Empathy': 'social_awareness',
    'Social Skills': 'relationship_management'
  };
  
  const category = mapping[dimension];
  if (!category) {
    console.error(`Unknown dimension: ${dimension}`);
    return 'self_awareness'; // Default fallback
  }
  return category;
}

async function insertQuestions() {
  try {
    // First, clear existing questions
    const { error: deleteError } = await supabase
      .from('eq_questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      throw deleteError;
    }

    console.log('Cleared existing questions');

    // Transform questions to match our schema
    const transformedQuestions = questions.map((q: QuestionData) => {
      const category = dimensionToCategory(q.dimension);
      console.log(`Converting question: "${q.question}" from dimension "${q.dimension}" to category "${category}"`);
      return {
        id: uuidv4(), // Generate a UUID for each question
        category,
        text: q.question,
        reverse_scored: false, // Default to false, you can modify this based on your needs
        explanation: q.explanation || null,
      };
    });

    // Insert questions in batches of 10
    for (let i = 0; i < transformedQuestions.length; i += 10) {
      const batch = transformedQuestions.slice(i, i + 10);
      const { error } = await supabase
        .from('eq_questions')
        .insert(batch);

      if (error) {
        throw error;
      }

      console.log(`Inserted questions ${i + 1} to ${i + batch.length}`);
    }

    console.log('Successfully inserted all questions!');
  } catch (err) {
    console.error('Error inserting questions:', err);
    process.exit(1);
  }
}

// Run the insertion
insertQuestions(); 