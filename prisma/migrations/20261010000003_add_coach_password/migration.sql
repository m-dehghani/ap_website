-- Add password column to coaches table
ALTER TABLE "coaches" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';

-- Update existing coaches with a default password (they should reset it on first login)
UPDATE "coaches" SET "password" = '$2a$10$defaultpasswordhash' WHERE "password" = '';