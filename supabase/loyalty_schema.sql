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

-- 6. Automated Loyalty Earning Function
CREATE OR REPLACE FUNCTION process_loyalty_on_order()
RETURNS TRIGGER AS $$
DECLARE
    found_customer_id UUID;
BEGIN
    -- Only trigger when order status changes to 'completed' and customer_name is present
    IF (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') AND NEW.customer_name IS NOT NULL) THEN
        
        -- Try to find existing customer or create new one
        -- Note: We use unique constraint on (cafe_id, customer_name)
        INSERT INTO customers (cafe_id, customer_name, total_spend, visit_count, last_visit, loyalty_points)
        VALUES (NEW.cafe_id, NEW.customer_name, NEW.total_amount, 1, NEW.created_at, FLOOR(NEW.total_amount))
        ON CONFLICT (cafe_id, customer_name) DO UPDATE SET
            total_spend = customers.total_spend + EXCLUDED.total_spend,
            visit_count = customers.visit_count + 1,
            last_visit = EXCLUDED.last_visit,
            loyalty_points = customers.loyalty_points + EXCLUDED.loyalty_points
        RETURNING id INTO found_customer_id;

        -- Log the earning transaction
        INSERT INTO loyalty_transactions (
            customer_id,
            cafe_id,
            points,
            type,
            description,
            created_at
        ) VALUES (
            found_customer_id,
            NEW.cafe_id,
            FLOOR(NEW.total_amount),
            'earn',
            'Earned from Order #' || NEW.id,
            NEW.created_at
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create Trigger
DROP TRIGGER IF EXISTS tr_earn_loyalty_on_order ON orders;
CREATE TRIGGER tr_earn_loyalty_on_order
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION process_loyalty_on_order();
