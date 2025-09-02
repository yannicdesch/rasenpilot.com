UPDATE subscribers 
SET 
  subscribed = true,
  subscription_tier = 'Premium',
  subscription_end = now() + interval '1 year',
  updated_at = now()
WHERE email = 'yannic.desch@gmail.com';