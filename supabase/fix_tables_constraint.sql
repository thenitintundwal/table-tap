-- Fix unique constraint on cafe_tables to include section
-- This allows table 1 to exist in both 'ac' and 'non_ac' sections

-- First, drop the old constraint
ALTER TABLE cafe_tables DROP CONSTRAINT IF EXISTS cafe_tables_cafe_id_table_number_key;

-- Add the new constraint
ALTER TABLE cafe_tables ADD CONSTRAINT cafe_tables_cafe_id_section_table_number_key UNIQUE(cafe_id, section, table_number);
