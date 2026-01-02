import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const body = await req.json()

        const { data, error } = await supabase
            .from('orders')
            .insert(body)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(req.url)
        const cafeId = searchParams.get('cafeId')

        let query = supabase.from('orders').select('*, order_items(*, menu_items(*))')

        if (cafeId) {
            query = query.eq('cafe_id', cafeId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
