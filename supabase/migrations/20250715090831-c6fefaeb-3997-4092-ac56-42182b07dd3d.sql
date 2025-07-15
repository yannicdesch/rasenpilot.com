-- Remove foreign key constraint if it exists (it might be implicitly created)
-- First, let's check and drop any foreign key constraints on user_id
DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop any foreign key constraints on the user_id column
    FOR constraint_record IN 
        SELECT constraint_name
        FROM information_schema.table_constraints 
        WHERE table_name = 'lawn_highscores' 
        AND constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE public.lawn_highscores DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Also drop any references constraint that might exist
ALTER TABLE public.lawn_highscores DROP CONSTRAINT IF EXISTS lawn_highscores_user_id_fkey;

-- Make sure the user_id column can accept any UUID value
-- (This should already be the case, but let's make sure)