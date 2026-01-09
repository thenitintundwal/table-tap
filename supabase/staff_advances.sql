-- 5. Staff Advances table (Loans/Advances)
CREATE TABLE IF NOT EXISTS staff_advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'recovered', 'partial_recovered')),
    repayment_method TEXT DEFAULT 'salary_deduction', -- 'salary_deduction', 'cash_return'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE staff_advances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cafe owners can manage staff advances" ON staff_advances
    FOR ALL USING (EXISTS (SELECT 1 FROM cafes WHERE id = staff_advances.cafe_id AND owner_id = auth.uid()));

-- Index
CREATE INDEX idx_staff_advances_staff ON staff_advances(staff_id);
CREATE INDEX idx_staff_advances_cafe ON staff_advances(cafe_id);
