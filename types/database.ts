export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            cafes: {
                Row: {
                    id: string
                    owner_id: string | null
                    name: string
                    description: string | null
                    logo_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id?: string | null
                    name: string
                    description?: string | null
                    logo_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string | null
                    name?: string
                    description?: string | null
                    logo_url?: string | null
                    created_at?: string
                }
            }
            menu_items: {
                Row: {
                    id: string
                    cafe_id: string | null
                    name: string
                    description: string | null
                    price: number
                    category: string
                    image_url: string | null
                    is_available: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    cafe_id?: string | null
                    name: string
                    description?: string | null
                    price: number
                    category: string
                    image_url?: string | null
                    is_available?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    cafe_id?: string | null
                    name?: string
                    description?: string | null
                    price?: number
                    category?: string
                    image_url?: string | null
                    is_available?: boolean
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    cafe_id: string | null
                    table_number: number
                    customer_name: string | null
                    status: 'pending' | 'preparing' | 'completed' | 'cancelled'
                    total_amount: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    cafe_id?: string | null
                    table_number: number
                    customer_name?: string | null
                    status?: 'pending' | 'preparing' | 'completed' | 'cancelled'
                    total_amount: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    cafe_id?: string | null
                    table_number?: number
                    customer_name?: string | null
                    status?: 'pending' | 'preparing' | 'completed' | 'cancelled'
                    total_amount?: number
                    created_at?: string
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string | null
                    menu_item_id: string | null
                    quantity: number
                    price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id?: string | null
                    menu_item_id?: string | null
                    quantity: number
                    price: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string | null
                    menu_item_id?: string | null
                    quantity?: number
                    price?: number
                    created_at?: string
                }
            }
            ratings: {
                Row: {
                    id: string
                    menu_item_id: string | null
                    order_id: string | null
                    rating: number
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    menu_item_id?: string | null
                    order_id?: string | null
                    rating: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    menu_item_id?: string | null
                    order_id?: string | null
                    rating?: number
                    comment?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
