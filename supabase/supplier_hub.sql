-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    category TEXT, -- 'produce', 'dairy', 'beverages', 'dry_goods', 'other'
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'ordered', 'delivered', 'cancelled'
    total_amount NUMERIC DEFAULT 0,
    expected_delivery DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Order Items (links to inventory items)
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC DEFAULT 0,
    total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier-Inventory mapping (which supplier provides which items)
CREATE TABLE IF NOT EXISTS supplier_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    unit_price NUMERIC DEFAULT 0,
    is_preferred BOOLEAN DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(supplier_id, inventory_item_id)
);

-- RLS Policies
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_inventory ENABLE ROW LEVEL SECURITY;

-- Suppliers policies
CREATE POLICY "Cafe owners can view their suppliers" ON suppliers
    FOR SELECT
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = suppliers.cafe_id));

CREATE POLICY "Cafe owners can insert suppliers" ON suppliers
    FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = suppliers.cafe_id));

CREATE POLICY "Cafe owners can update their suppliers" ON suppliers
    FOR UPDATE
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = suppliers.cafe_id));

CREATE POLICY "Cafe owners can delete their suppliers" ON suppliers
    FOR DELETE
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = suppliers.cafe_id));

-- Purchase Orders policies
CREATE POLICY "Cafe owners can view their purchase orders" ON purchase_orders
    FOR SELECT
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = purchase_orders.cafe_id));

CREATE POLICY "Cafe owners can insert purchase orders" ON purchase_orders
    FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = purchase_orders.cafe_id));

CREATE POLICY "Cafe owners can update their purchase orders" ON purchase_orders
    FOR UPDATE
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = purchase_orders.cafe_id));

CREATE POLICY "Cafe owners can delete their purchase orders" ON purchase_orders
    FOR DELETE
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = purchase_orders.cafe_id));

-- Purchase Order Items policies
CREATE POLICY "Cafe owners can view PO items" ON purchase_order_items
    FOR SELECT
    USING (auth.uid() IN (
        SELECT owner_id FROM cafes 
        WHERE id IN (SELECT cafe_id FROM purchase_orders WHERE id = purchase_order_items.purchase_order_id)
    ));

CREATE POLICY "Cafe owners can insert PO items" ON purchase_order_items
    FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT owner_id FROM cafes 
        WHERE id IN (SELECT cafe_id FROM purchase_orders WHERE id = purchase_order_items.purchase_order_id)
    ));

CREATE POLICY "Cafe owners can update PO items" ON purchase_order_items
    FOR UPDATE
    USING (auth.uid() IN (
        SELECT owner_id FROM cafes 
        WHERE id IN (SELECT cafe_id FROM purchase_orders WHERE id = purchase_order_items.purchase_order_id)
    ));

CREATE POLICY "Cafe owners can delete PO items" ON purchase_order_items
    FOR DELETE
    USING (auth.uid() IN (
        SELECT owner_id FROM cafes 
        WHERE id IN (SELECT cafe_id FROM purchase_orders WHERE id = purchase_order_items.purchase_order_id)
    ));

-- Supplier Inventory policies
CREATE POLICY "Cafe owners can view supplier inventory" ON supplier_inventory
    FOR SELECT
    USING (auth.uid() IN (
        SELECT owner_id FROM cafes 
        WHERE id IN (SELECT cafe_id FROM suppliers WHERE id = supplier_inventory.supplier_id)
    ));

CREATE POLICY "Cafe owners can manage supplier inventory" ON supplier_inventory
    FOR ALL
    USING (auth.uid() IN (
        SELECT owner_id FROM cafes 
        WHERE id IN (SELECT cafe_id FROM suppliers WHERE id = supplier_inventory.supplier_id)
    ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_suppliers_cafe_id ON suppliers(cafe_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_cafe_id ON purchase_orders(cafe_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_inventory_supplier_id ON supplier_inventory(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_inventory_item_id ON supplier_inventory(inventory_item_id);
