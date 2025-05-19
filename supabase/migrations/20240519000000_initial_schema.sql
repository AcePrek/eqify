-- Create tables
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.eq_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category text NOT NULL CHECK (category IN ('self_awareness', 'self_management', 'social_awareness', 'relationship_management')),
    text text NOT NULL,
    reverse_scored boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.eq_test_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.eq_responses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES public.eq_test_sessions(id) ON DELETE CASCADE,
    question_id uuid REFERENCES public.eq_questions(id) ON DELETE CASCADE,
    response integer NOT NULL CHECK (response >= 1 AND response <= 5),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eq_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eq_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Profiles can be created for new users"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Users can view their own test sessions"
    ON public.eq_test_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test sessions"
    ON public.eq_test_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test sessions"
    ON public.eq_test_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses"
    ON public.eq_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.eq_test_sessions
            WHERE id = eq_responses.session_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own responses"
    ON public.eq_responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.eq_test_sessions
            WHERE id = eq_responses.session_id
            AND user_id = auth.uid()
        )
    );

-- Insert sample questions
INSERT INTO public.eq_questions (category, text, reverse_scored) VALUES
('self_awareness', 'I can accurately identify my emotions as they occur', false),
('self_awareness', 'I struggle to understand why I feel certain ways', true),
('self_management', 'I can stay calm under pressure', false),
('self_management', 'I have difficulty controlling my impulses', true),
('social_awareness', 'I can sense others'' feelings and perspectives', false),
('social_awareness', 'I find it hard to read the room in social situations', true),
('relationship_management', 'I can handle conflicts constructively', false),
('relationship_management', 'I avoid difficult conversations with others', true);

-- Set up realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.eq_test_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eq_responses; 