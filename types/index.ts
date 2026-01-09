export interface Cafe {
    id: string
    owner_id: string
    name: string
    description?: string
    logo_url?: string
    subscription_plan?: 'basic' | 'pro'
    telegram_bot_token?: string
    telegram_chat_id?: string
    created_at: string
}

export interface Staff {
    id: string
    cafe_id: string
    name: string
    role: 'manager' | 'server' | 'chef'
    designation?: string
    department?: string
    email?: string
    phone?: string
    hourly_rate?: number
    monthly_salary?: number
    pin?: string
    is_active: boolean
    joined_at: string
    created_at: string
}

export interface StaffShift {
    id: string
    cafe_id: string
    name: string
    start_time: string
    end_time: string
    created_at: string
}

export interface StaffAttendance {
    id: string
    cafe_id: string
    staff_id: string
    shift_id?: string
    check_in: string
    check_out?: string
    status: 'present' | 'absent' | 'on_leave' | 'on_break'
    notes?: string
    created_at: string
}

export interface PayrollRecord {
    id: string
    cafe_id: string
    staff_id: string
    period_start: string
    period_end: string
    base_salary: number
    bonus: number
    deductions: number
    net_pay: number
    status: 'pending' | 'processed' | 'paid'
    processed_at?: string
    created_at: string
}

export interface MenuItem {
    id: string
    cafe_id: string
    name: string
    description?: string
    price: number
    category: string
    image_url?: string
    is_available: boolean
    cost_price?: number
    created_at: string
    avg_rating?: number
    total_ratings?: number
}

export interface Order {
    id: string
    cafe_id: string
    table_number: number
    customer_name?: string
    status: 'pending' | 'preparing' | 'completed' | 'cancelled'
    total_amount: number
    created_at: string
}

export interface Customer {
    id: string
    cafe_id: string
    table_number: number
    customer_name?: string
    status: 'pending' | 'preparing' | 'completed' | 'cancelled'
    total_spend: number
    visit_count: number
    last_visit: string
    loyalty_points?: number
}

export interface OrderItem {
    id: string
    order_id: string
    menu_item_id: string
    quantity: number
    price: number
    menu_item?: MenuItem
}

export interface Rating {
    id: string
    cafe_id: string
    menu_item_id: string
    customer_name?: string
    rating: number
    comment?: string
    created_at: string
}

export interface Supplier {
    id: string
    cafe_id: string
    name: string
    contact_person?: string
    phone?: string
    email?: string
    address?: string
    category?: 'produce' | 'dairy' | 'beverages' | 'dry_goods' | 'other'
    notes?: string
    is_active: boolean
    created_at: string
}

export interface PurchaseOrder {
    id: string
    cafe_id: string
    supplier_id?: string
    order_number: string
    status: 'pending' | 'ordered' | 'delivered' | 'cancelled'
    total_amount: number
    expected_delivery?: string
    notes?: string
    created_at: string
    updated_at: string
}

export interface PurchaseOrderItem {
    id: string
    purchase_order_id: string
    inventory_item_id?: string
    item_name: string
    quantity: number
    unit_price: number
    total_price: number
    created_at: string
}

export interface Invoice {
    id: string
    cafe_id: string
    type: 'sales' | 'purchase'
    invoice_number: string
    party_name: string
    subtotal: number
    tax_amount: number
    discount_amount: number
    total_amount: number
    status: 'paid' | 'unpaid' | 'partial' | 'cancelled'
    due_date?: string
    invoice_date: string
    notes?: string
    created_at: string
}

export interface BusinessExpense {
    id: string
    cafe_id: string
    category: string
    amount: number
    date: string
    description?: string
    payment_method: 'cash' | 'bank' | 'upi'
    created_at: string
}

export interface AccountsLedger {
    id: string
    cafe_id: string
    account_name: string
    account_type: 'bank' | 'cash'
    current_balance: number
    created_at: string
}

export interface FinancialParty {
    id: string
    cafe_id: string
    name: string
    type: 'vendor' | 'customer' | 'both'
    phone?: string
    email?: string
    outstanding_balance: number
    created_at: string
}
