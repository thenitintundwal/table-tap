-- Tables configuration for POS
CREATE TABLE IF NOT EXISTS cafe_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    table_number INTEGER NOT NULL,
    section TEXT DEFAULT 'main', -- 'ac', 'non_ac', 'bar', 'outdoor', etc.
    capacity INTEGER DEFAULT 4,
    status TEXT DEFAULT 'available', -- 'available', 'occupied', 'reserved', 'cleaning'
    current_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    x_position INTEGER DEFAULT 0,
    y_position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cafe_id, table_number)
);

-- RLS
ALTER TABLE cafe_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cafe owners can manage their tables" ON cafe_tables
    FOR ALL
    USING (auth.uid() IN (SELECT owner_id FROM cafes WHERE id = cafe_tables.cafe_id));

-- Index
CREATE INDEX IF NOT EXISTS idx_cafe_tables_cafe_id ON cafe_tables(cafe_id);
CREATE INDEX IF NOT EXISTS idx_cafe_tables_status ON cafe_tables(status);
