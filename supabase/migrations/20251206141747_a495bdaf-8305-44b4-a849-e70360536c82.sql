-- Add office email field to agencies table
ALTER TABLE public.agencies 
ADD COLUMN email text;