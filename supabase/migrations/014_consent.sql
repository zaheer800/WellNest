-- Record when the user explicitly accepted the Terms of Service and Privacy Policy
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_accepted_at timestamptz;
