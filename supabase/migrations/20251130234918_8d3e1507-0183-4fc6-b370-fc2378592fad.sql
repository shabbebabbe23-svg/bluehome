-- Add area and owner fields to agencies table
ALTER TABLE public.agencies
ADD COLUMN IF NOT EXISTS area TEXT,
ADD COLUMN IF NOT EXISTS owner TEXT;