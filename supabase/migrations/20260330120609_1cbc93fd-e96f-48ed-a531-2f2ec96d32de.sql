INSERT INTO public.user_roles (user_id, role)
VALUES ('842ab30a-8c0d-41d7-8006-601ab9f8f2dc', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;