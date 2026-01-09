-- Add cost_price for profitability calculations
ALTER TABLE menu_items ADD COLUMN cost_price NUMERIC DEFAULT 0;