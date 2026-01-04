export interface Cafe {
    id: string
    owner_id: string
    name: string
    description?: string
    logo_url?: string
    created_at: string
    subscription_plan?: 'basic' | 'pro'
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
    menu_item_id: string
    order_id: string
    rating: number
    comment?: string
    created_at: string
}
