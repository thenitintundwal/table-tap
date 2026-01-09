-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    total_spend NUMERIC DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cafe_id, customer_name)
);

-- RLS for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cafe owners can view their customers" ON customers
    FOR SELECT
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = customers.cafe_id));

CREATE POLICY "Cafe owners can insert customers" ON customers
    FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = customers.cafe_id));

CREATE POLICY "Cafe owners can update their customers" ON customers
    FOR UPDATE
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = customers.cafe_id));

-- Track loyalty transaction history
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE,
    points INTEGER NOT NULL, -- Positive for earn, negative for redeem
    type TEXT NOT NULL, -- 'earn', 'redeem', 'bonus'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for loyalty_transactions
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cafe owners can view loyalty txns" ON loyalty_transactions
    FOR SELECT
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = loyalty_transactions.cafe_id));

CREATE POLICY "Cafe owners can insert loyalty txns" ON loyalty_transactions
    FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = loyalty_transactions.cafe_id));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_customers_cafe_id ON customers(cafe_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_cafe_id ON loyalty_transactions(cafe_id);
