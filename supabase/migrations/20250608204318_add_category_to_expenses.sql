/*
  # Add category_id to expenses table
  
  This migration adds a category_id column to the expenses table to link expenses to categories.
*/

-- Add category_id column to expenses table
ALTER TABLE expenses ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_expenses_category_id ON expenses(category_id); 