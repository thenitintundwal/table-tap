-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    total_spend NUMERIC DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    loyalty_points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'BRONZE' CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
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

-- Cafe specific loyalty settings
CREATE TABLE IF NOT EXISTS loyalty_settings (
    cafe_id UUID PRIMARY KEY REFERENCES cafes(id) ON DELETE CASCADE,
    earn_multiplier NUMERIC DEFAULT 1.0, -- Points per 1 unit of currency
    redemption_multiplier NUMERIC DEFAULT 0.1, -- Currency value per 1 point
    min_redemption_points INTEGER DEFAULT 100,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE loyalty_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cafe owners can manage their loyalty settings" ON loyalty_settings
    FOR ALL
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = loyalty_settings.cafe_id));

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
    v_earn_multiplier NUMERIC;
    v_points_earned INTEGER;
    v_total_spend NUMERIC;
    v_new_tier TEXT;
BEGIN
    -- Only trigger when order status changes to 'completed'
    IF (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') AND NEW.customer_name IS NOT NULL) THEN
        
        -- Get cafe settings or default to 1.0
        SELECT earn_multiplier INTO v_earn_multiplier 
        FROM loyalty_settings WHERE cafe_id = NEW.cafe_id;
        
        IF v_earn_multiplier IS NULL THEN v_earn_multiplier := 1.0; END IF;

        v_points_earned := FLOOR(NEW.total_amount * v_earn_multiplier);
        
        -- Insert or update customer
        INSERT INTO customers (cafe_id, customer_name, total_spend, visit_count, last_visit, loyalty_points)
        VALUES (NEW.cafe_id, NEW.customer_name, NEW.total_amount, 1, NEW.created_at, v_points_earned)
        ON CONFLICT (cafe_id, customer_name) DO UPDATE SET
            total_spend = customers.total_spend + EXCLUDED.total_spend,
            visit_count = customers.visit_count + 1,
            last_visit = EXCLUDED.last_visit,
            loyalty_points = customers.loyalty_points + EXCLUDED.loyalty_points
        RETURNING id, total_spend INTO found_customer_id, v_total_spend;

        -- Tier calculation logic
        v_new_tier := CASE 
            WHEN v_total_spend >= 50000 THEN 'PLATINUM'
            WHEN v_total_spend >= 25000 THEN 'GOLD'
            WHEN v_total_spend >= 10000 THEN 'SILVER'
            ELSE 'BRONZE'
        END;

        UPDATE customers SET tier = v_new_tier WHERE id = found_customer_id;

        -- Log earning
        INSERT INTO loyalty_transactions (customer_id, cafe_id, points, type, description, created_at)
        VALUES (found_customer_id, NEW.cafe_id, v_points_earned, 'earn', 'Earned from Order #' || NEW.id, NEW.created_at);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure Redemption Function
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
    p_customer_id UUID,
    p_cafe_id UUID,
    p_points_to_redeem INTEGER,
    p_description TEXT DEFAULT 'Points Redemption'
)
RETURNS JSON AS $$
DECLARE
    v_current_points INTEGER;
    v_redemption_multiplier NUMERIC;
    v_discount_value NUMERIC;
BEGIN
    -- Check points
    SELECT loyalty_points INTO v_current_points 
    FROM customers WHERE id = p_customer_id AND cafe_id = p_cafe_id;

    IF v_current_points IS NULL OR v_current_points < p_points_to_redeem THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient points');
    END IF;

    -- Get multiplier
    SELECT redemption_multiplier INTO v_redemption_multiplier 
    FROM loyalty_settings WHERE cafe_id = p_cafe_id;
    
    IF v_redemption_multiplier IS NULL THEN v_redemption_multiplier := 0.1; END IF;

    v_discount_value := p_points_to_redeem * v_redemption_multiplier;

    -- Update customer points
    UPDATE customers 
    SET loyalty_points = loyalty_points - p_points_to_redeem
    WHERE id = p_customer_id;

    -- Log transaction
    INSERT INTO loyalty_transactions (customer_id, cafe_id, points, type, description)
    VALUES (p_customer_id, p_cafe_id, -p_points_to_redeem, 'redeem', p_description);

    RETURN json_build_object(
        'success', true, 
        'points_redeemed', p_points_to_redeem,
        'discount_value', v_discount_value
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create Trigger
DROP TRIGGER IF EXISTS tr_earn_loyalty_on_order ON orders;
CREATE TRIGGER tr_earn_loyalty_on_order
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION process_loyalty_on_order();
