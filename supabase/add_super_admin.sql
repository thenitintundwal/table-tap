-- Add your email to the super_admins table
-- Replace 'your-email@example.com' with your actual login email

INSERT INTO super_admins (email)
VALUES ('thenitintundwal07@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Verify the insertion
SELECT * FROM super_admins;
