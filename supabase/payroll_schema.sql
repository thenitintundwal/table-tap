-- HR and Payroll Schema Extension

-- 1. Enhance Staff table
ALTER TABLE staff ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS monthly_salary DECIMAL(10,2) DEFAULT 0;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Shifts table
CREATE TABLE IF NOT EXISTS staff_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g., 'Morning Shift', 'Noon Shift'
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Attendance table
CREATE TABLE IF NOT EXISTS staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
    shift_id UUID REFERENCES staff_shifts(id) ON DELETE SET NULL,
    check_in TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_out TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'present', -- 'present', 'absent', 'on_leave', 'on_break'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Payroll records table
CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
    bonus DECIMAL(10,2) NOT NULL DEFAULT 0,
    deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'paid'
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Cafe owners can manage their shifts" ON staff_shifts
    FOR ALL USING (EXISTS (SELECT 1 FROM cafes WHERE id = staff_shifts.cafe_id AND owner_id = auth.uid()));

CREATE POLICY "Cafe owners can manage staff attendance" ON staff_attendance
    FOR ALL USING (EXISTS (SELECT 1 FROM cafes WHERE id = staff_attendance.cafe_id AND owner_id = auth.uid()));

CREATE POLICY "Cafe owners can manage payroll" ON payroll_records
    FOR ALL USING (EXISTS (SELECT 1 FROM cafes WHERE id = payroll_records.cafe_id AND owner_id = auth.uid()));

-- Insert default shifts for convenience
-- This can be handled in logic too, but helpful for initial state
-- Note: cafe_id needs to be valid, so we'll do this client-side or via a trigger if needed.
