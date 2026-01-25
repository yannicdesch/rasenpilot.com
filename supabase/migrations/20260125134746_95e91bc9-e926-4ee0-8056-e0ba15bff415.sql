-- Temporarily enable update for admins via SQL
UPDATE subscribers 
SET subscribed = true, 
    subscription_tier = 'monthly', 
    subscription_end = (NOW() + INTERVAL '1 month')::timestamp with time zone,
    is_trial = true,
    trial_start = NOW(),
    trial_end = (NOW() + INTERVAL '7 days')::timestamp with time zone,
    updated_at = NOW()
WHERE email = 'yannic.desch@gmail.com';