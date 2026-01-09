-- Invoice and Accounts Schema Extension

-- 1. Invoices Table (Combined Sales and Purchase)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sales', 'purchase')),
    invoice_number TEXT NOT NULL,
    party_name TEXT NOT NULL,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial', 'cancelled')),
    due_date DATE,
    invoice_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Business Expenses Table
CREATE TABLE IF NOT EXISTS business_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Rent', 'Electricity', 'Internet', 'Marketing'
    amount DECIMAL(12,2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    payment_method TEXT DEFAULT 'cash', -- 'cash', 'bank', 'upi'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Accounts Ledger (Cash/Bank Tracking)
CREATE TABLE IF NOT EXISTS accounts_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    account_name TEXT NOT NULL, -- e.g., 'HDFC Bank', 'Cash in Hand', 'Petty Cash'
    account_type TEXT DEFAULT 'bank' CHECK (account_type IN ('bank', 'cash')),
    current_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Parties Table (Vendors and Customers for Receivables/Payables)
CREATE TABLE IF NOT EXISTS financial_parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('vendor', 'customer', 'both')),
    phone TEXT,
    email TEXT,
    outstanding_balance DECIMAL(15,2) DEFAULT 0, -- +ve for Payable, -ve for Receivable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_parties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Cafe owners can manage their invoices" ON invoices
    FOR ALL USING (EXISTS (SELECT 1 FROM cafes WHERE id = invoices.cafe_id AND owner_id = auth.uid()));

CREATE POLICY "Cafe owners can manage their expenses" ON business_expenses
    FOR ALL USING (EXISTS (SELECT 1 FROM cafes WHERE id = business_expenses.cafe_id AND owner_id = auth.uid()));

CREATE POLICY "Cafe owners can manage their ledger" ON accounts_ledger
    FOR ALL USING (EXISTS (SELECT 1 FROM cafes WHERE id = accounts_ledger.cafe_id AND owner_id = auth.uid()));

CREATE POLICY "Cafe owners can manage their financial parties" ON financial_parties
    FOR ALL USING (EXISTS (SELECT 1 FROM cafes WHERE id = financial_parties.cafe_id AND owner_id = auth.uid()));

-- Indexes for performance
CREATE INDEX idx_invoices_cafe_date ON invoices(cafe_id, invoice_date);
CREATE INDEX idx_expenses_cafe_date ON business_expenses(cafe_id, date);

-- 5. Automation Triggers for Party Balances
CREATE OR REPLACE FUNCTION update_party_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE financial_parties 
        SET outstanding_balance = outstanding_balance + 
            CASE 
                WHEN NEW.type = 'purchase' THEN NEW.total_amount 
                WHEN NEW.type = 'sales' THEN -NEW.total_amount 
                ELSE 0 
            END
        WHERE name = NEW.party_name AND cafe_id = NEW.cafe_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE financial_parties 
        SET outstanding_balance = outstanding_balance - 
            CASE 
                WHEN OLD.type = 'purchase' THEN OLD.total_amount 
                WHEN OLD.type = 'sales' THEN -OLD.total_amount 
                ELSE 0 
            END
        WHERE name = OLD.party_name AND cafe_id = OLD.cafe_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_party_balance
AFTER INSERT OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_party_balance();
