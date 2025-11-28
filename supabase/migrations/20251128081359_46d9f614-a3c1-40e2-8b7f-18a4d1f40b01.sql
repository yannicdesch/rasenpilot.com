-- Insert artificial high score entries to populate the leaderboard
-- These are dummy entries to make the page look active

INSERT INTO public.lawn_highscores (user_id, user_name, lawn_score, location, grass_type, lawn_size, analysis_date)
VALUES
  -- Top performers (scores 90+)
  (gen_random_uuid(), 'Thomas Müller', 94, 'München', 'Sportrasen', '200-500 m²', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'Sarah Schmidt', 92, 'Hamburg', 'Zierrasen', '100-200 m²', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'Michael Weber', 91, 'Berlin', 'Schattenrasen', '500+ m²', NOW() - INTERVAL '1 week'),
  
  -- Strong performers (scores 80-89)
  (gen_random_uuid(), 'Anna Becker', 88, 'Frankfurt', 'Spielrasen', '200-500 m²', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'Peter Hoffmann', 87, 'Köln', 'Sportrasen', '100-200 m²', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'Julia Richter', 85, 'Stuttgart', 'Zierrasen', '<100 m²', NOW() - INTERVAL '1 week'),
  (gen_random_uuid(), 'Markus Klein', 84, 'Düsseldorf', 'Gebrauchsrasen', '200-500 m²', NOW() - INTERVAL '6 days'),
  (gen_random_uuid(), 'Laura Wagner', 82, 'Leipzig', 'Spielrasen', '100-200 m²', NOW() - INTERVAL '9 days'),
  
  -- Good performers (scores 75-79)
  (gen_random_uuid(), 'Stefan Fischer', 80, 'Dortmund', 'Sportrasen', '500+ m²', NOW() - INTERVAL '8 days'),
  (gen_random_uuid(), 'Nicole Braun', 78, 'Essen', 'Zierrasen', '200-500 m²', NOW() - INTERVAL '1 week'),
  (gen_random_uuid(), 'Christian Schulz', 76, 'Bremen', 'Schattenrasen', '100-200 m²', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), 'Sandra Meyer', 75, 'Hannover', 'Spielrasen', '200-500 m²', NOW() - INTERVAL '2 weeks'),
  
  -- Average performers (scores 70-74)
  (gen_random_uuid(), 'Andreas Koch', 73, 'Nürnberg', 'Gebrauchsrasen', '<100 m²', NOW() - INTERVAL '12 days'),
  (gen_random_uuid(), 'Katharina Wolf', 71, 'Dresden', 'Zierrasen', '100-200 m²', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), 'Martin Lang', 72, 'Wiesbaden', 'Zierrasen', '200-500 m²', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'Jennifer Krüger', 70, 'Freiburg', 'Spielrasen', '100-200 m²', NOW() - INTERVAL '2 days'),
  
  -- Lower performers (scores 65-69)
  (gen_random_uuid(), 'Daniel Krause', 69, 'Bonn', 'Sportrasen', '200-500 m²', NOW() - INTERVAL '2 weeks'),
  (gen_random_uuid(), 'Sabine Lehmann', 68, 'Mannheim', 'Spielrasen', '100-200 m²', NOW() - INTERVAL '18 days'),
  (gen_random_uuid(), 'Oliver Zimmermann', 66, 'Karlsruhe', 'Gebrauchsrasen', '500+ m²', NOW() - INTERVAL '3 weeks'),
  (gen_random_uuid(), 'Lisa Hartmann', 65, 'Augsburg', 'Schattenrasen', '<100 m²', NOW() - INTERVAL '20 days');