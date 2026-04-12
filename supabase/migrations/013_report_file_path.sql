-- Store the storage path for patient file downloads
-- image_url holds the (expiring) signed URL used for AI processing
-- file_path holds the permanent storage path for on-demand signed URL generation

ALTER TABLE lab_reports     ADD COLUMN IF NOT EXISTS file_path text;
ALTER TABLE imaging_reports ADD COLUMN IF NOT EXISTS file_path text;
