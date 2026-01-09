-- 1. Menu Item Ingredients (Recipe Table)
CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    quantity_required NUMERIC NOT NULL, -- e.g. 0.2 for 200ml
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(menu_item_id, inventory_item_id)
);

-- 2. Inventory Transaction Logs
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    change_amount NUMERIC NOT NULL,
    previous_quantity NUMERIC NOT NULL,
    new_quantity NUMERIC NOT NULL,
    type TEXT CHECK (type IN ('purchase', 'sale', 'adjustment', 'return')),
    reference_id UUID, -- order_id or purchase_order_id
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Cafe owners can manage recipes" ON menu_item_ingredients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cafes 
            JOIN menu_items ON cafes.id = menu_items.cafe_id
            WHERE menu_items.id = menu_item_ingredients.menu_item_id 
            AND cafes.owner_id = auth.uid()
        )
    );

CREATE POLICY "Cafe owners can view logs" ON inventory_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cafes WHERE cafes.id = inventory_logs.cafe_id AND cafes.owner_id = auth.uid()
        )
    );

-- 5. Automated Stock Deduction Function
CREATE OR REPLACE FUNCTION deduct_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
    ingredient_record RECORD;
    current_qty NUMERIC;
BEGIN
    -- Only trigger when order status changes to 'completed'
    IF (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed')) THEN
        -- Loop through all items in the order
        FOR item_record IN 
            SELECT menu_item_id, quantity FROM order_items WHERE order_id = NEW.id
        LOOP
            -- For each item, find its ingredients
            FOR ingredient_record IN 
                SELECT inventory_item_id, quantity_required FROM menu_item_ingredients WHERE menu_item_id = item_record.menu_item_id
            LOOP
                -- Get current stock
                SELECT quantity INTO current_qty FROM inventory_items WHERE id = ingredient_record.inventory_item_id;
                
                -- Update inventory
                UPDATE inventory_items 
                SET quantity = quantity - (ingredient_record.quantity_required * item_record.quantity),
                    last_updated = NOW()
                WHERE id = ingredient_record.inventory_item_id;

                -- Log the transaction
                INSERT INTO inventory_logs (
                    cafe_id,
                    inventory_item_id,
                    change_amount,
                    previous_quantity,
                    new_quantity,
                    type,
                    reference_id,
                    notes
                ) VALUES (
                    NEW.cafe_id,
                    ingredient_record.inventory_item_id,
                    -(ingredient_record.quantity_required * item_record.quantity),
                    current_qty,
                    current_qty - (ingredient_record.quantity_required * item_record.quantity),
                    'sale',
                    NEW.id,
                    'Automated deduction for order #' || NEW.id
                );
            END LOOP;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create Trigger
DROP TRIGGER IF EXISTS tr_deduct_inventory_on_order ON orders;
CREATE TRIGGER tr_deduct_inventory_on_order
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION deduct_inventory_on_order();

-- 7. Add Column to purchase_order_items if missing (already exists in supplier_hub.sql)
-- 8. Add trigger for Purchase Orders as well
CREATE OR REPLACE FUNCTION update_inventory_on_delivery()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
    current_qty NUMERIC;
BEGIN
    -- Only trigger when PO status changes to 'delivered'
    IF (NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered')) THEN
        FOR item_record IN 
            SELECT inventory_item_id, quantity FROM purchase_order_items WHERE purchase_order_id = NEW.id
        LOOP
            IF item_record.inventory_item_id IS NOT NULL THEN
                -- Get current stock
                SELECT quantity INTO current_qty FROM inventory_items WHERE id = item_record.inventory_item_id;

                -- Update inventory
                UPDATE inventory_items 
                SET quantity = quantity + item_record.quantity,
                    last_updated = NOW()
                WHERE id = item_record.inventory_item_id;

                -- Log the transaction
                INSERT INTO inventory_logs (
                    cafe_id,
                    inventory_item_id,
                    change_amount,
                    previous_quantity,
                    new_quantity,
                    type,
                    reference_id,
                    notes
                ) VALUES (
                    NEW.cafe_id,
                    item_record.inventory_item_id,
                    item_record.quantity,
                    current_qty,
                    current_qty + item_record.quantity,
                    'purchase',
                    NEW.id,
                    'Stock added from PO #' || NEW.order_number
                );
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_inventory_on_delivery ON purchase_orders;
CREATE TRIGGER tr_update_inventory_on_delivery
AFTER UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_delivery();

-- 9. Trigger for manual inventory updates (adjustments)
CREATE OR REPLACE FUNCTION log_inventory_adjustment()
RETURNS TRIGGER AS $$
BEGIN
    -- Log only if quantity changes and it's not from an automated source (optional: check session variables if needed, but here we just log anything that changes)
    -- Actually, for simplicity, we log all quantity changes that aren't already logged by the other triggers.
    -- But triggers run in same transaction, so it might be tricky.
    -- Easier: Only log if the quantity was updated manually (direct UPDATE).
    IF (OLD.quantity != NEW.quantity) THEN
        -- We check if a log was already created in this transaction for this item.
        -- In Supabase/Postgres, we can't easily check 'this transaction's other logs' without a join.
        -- However, the 'type' in logs helps.
        -- For now, let's just make sure manual adjustments are logged.
        -- To avoid double logging, we can check if it's a manual adjustment.
        -- But how? Let's assume most updates are manual unless reference_id is set.
        
        -- Let's just create a more generic log for manual updates
        -- Note: If this trigger fires, and a PO trigger also fired, we might get two logs.
        -- A better way is to handle logging inside the application layer for manual updates,
        -- OR use a separate function for manual adjustments.
        
        -- Let's skip the trigger for manual updates for now to avoid complexity with automated ones,
        -- and handle manual logging in the `useInventory` hook.
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
