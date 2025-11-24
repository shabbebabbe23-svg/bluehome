-- Steg 1: Lägg till nya roller i app_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'superadmin') THEN
    ALTER TYPE app_role ADD VALUE 'superadmin';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'agency_admin') THEN
    ALTER TYPE app_role ADD VALUE 'agency_admin';
  END IF;
END $$;