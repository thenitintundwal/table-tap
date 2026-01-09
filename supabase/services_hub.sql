-- Inventory Items Table
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 0, -- Supports Kg/L with 3 decimal places
  unit TEXT NOT NULL, -- 'kg', 'g', 'l', 'ml', 'pcs'
  min_threshold DECIMAL(10,3) DEFAULT 5,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Table
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'server', -- 'manager', 'server', 'chef'
  pin TEXT, -- Simple 4 digit pin for internal access
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Inventory Policies
CREATE POLICY "Cafe owners can manage inventory" ON inventory_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cafes WHERE cafes.id = inventory_items.cafe_id AND cafes.owner_id = auth.uid()
    )
  );

-- Staff Policies
CREATE POLICY "Cafe owners can manage staff" ON staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cafes WHERE cafes.id = staff.cafe_id AND cafes.owner_id = auth.uid()
    )
  );

-- Create simple indexes
CREATE INDEX idx_inventory_cafe ON inventory_items(cafe_id);
CREATE INDEX idx_staff_cafe ON staff(cafe_id);
