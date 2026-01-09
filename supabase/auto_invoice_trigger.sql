-- Trigger to automatically generate an invoice when a POS order is completed
CREATE OR REPLACE FUNCTION generate_order_invoice()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if status is transitioning to 'completed'
    IF (NEW.status = 'completed' AND OLD.status != 'completed') THEN
        INSERT INTO invoices (
            cafe_id,
            type,
            invoice_number,
            party_name,
            subtotal,
            tax_amount,
            discount_amount,
            total_amount,
            status,
            invoice_date
        ) VALUES (
            NEW.cafe_id,
            'sales',
            'POS-' || upper(substring(replace(NEW.id::text, '-', ''), 1, 8)),
            COALESCE(NEW.customer_name, 'Walk-in Customer'),
            NEW.total_amount,
            0,
            0,
            NEW.total_amount,
            'paid',
            CURRENT_DATE
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS tr_auto_invoice_on_order_completion ON orders;

CREATE TRIGGER tr_auto_invoice_on_order_completion
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_invoice();
