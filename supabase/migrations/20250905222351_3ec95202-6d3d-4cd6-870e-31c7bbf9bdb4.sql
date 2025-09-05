-- Add is_test_mode column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN is_test_mode BOOLEAN NOT NULL DEFAULT false;