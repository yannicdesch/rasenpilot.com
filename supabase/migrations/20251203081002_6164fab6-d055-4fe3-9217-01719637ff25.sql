-- Reset free tier limit by deleting completed analyses for the user
DELETE FROM analysis_jobs 
WHERE user_id = '842ab30a-8c0d-41d7-8006-601ab9f8f2dc' 
AND status = 'completed';