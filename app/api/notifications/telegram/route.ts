import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { order, items, cafe } = await request.json()

        if (!cafe.telegram_bot_token || !cafe.telegram_chat_id) {
            return NextResponse.json({ success: false, error: 'Telegram not configured' }, { status: 400 })
        }

        // Format items list
        const itemsList = items
            .map((item: any) => `• ${item.quantity}x ${item.name || item.menu_item?.name}`)
            .join('\n')

        // Construct message
        const message = `
🔔 *New Order Received!*

📍 *Table:* ${order.table_number}
👤 *Customer:* ${order.customer_name || 'Guest'}
----------------------------
${itemsList}
----------------------------
💰 *Total:* $${order.total_amount.toFixed(2)}

✅ [View Order](https://table-tap.vercel.app/dashboard/orders)
`.trim()

        // Send to Telegram
        const telegramUrl = `https://api.telegram.org/bot${cafe.telegram_bot_token}/sendMessage`

        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: cafe.telegram_chat_id,
                text: message,
                parse_mode: 'Markdown',
            }),
        })

        const result = await response.json()

        if (!result.ok) {
            console.error('Telegram API Error:', result)
            return NextResponse.json({ success: false, error: result.description }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Telegram Notification Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
