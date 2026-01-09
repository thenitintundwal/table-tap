/**
 * Browser Push Notification Utility
 * Handles native browser notifications for staff alerts
 */

export class PushNotificationManager {
    private static instance: PushNotificationManager
    private permission: NotificationPermission = 'default'

    private constructor() {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            this.permission = Notification.permission
        }
    }

    static getInstance(): PushNotificationManager {
        if (!PushNotificationManager.instance) {
            PushNotificationManager.instance = new PushNotificationManager()
        }
        return PushNotificationManager.instance
    }

    /**
     * Request permission from user to show notifications
     */
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications')
            return false
        }

        if (this.permission === 'granted') {
            return true
        }

        try {
            const permission = await Notification.requestPermission()
            this.permission = permission
            return permission === 'granted'
        } catch (error) {
            console.error('Error requesting notification permission:', error)
            return false
        }
    }

    /**
     * Check if notifications are supported and permitted
     */
    isSupported(): boolean {
        return typeof window !== 'undefined' && 'Notification' in window
    }

    isGranted(): boolean {
        return this.permission === 'granted'
    }

    /**
     * Send a notification
     */
    async notify(title: string, options?: NotificationOptions): Promise<void> {
        if (!this.isSupported()) {
            console.warn('Notifications not supported')
            return
        }

        if (!this.isGranted()) {
            const granted = await this.requestPermission()
            if (!granted) {
                console.warn('Notification permission denied')
                return
            }
        }

        try {
            const notification = new Notification(title, {
                icon: '/logo.png',
                badge: '/logo.png',
                vibrate: [200, 100, 200],
                requireInteraction: true, // Stays until user interacts
                ...options
            } as any)

            // Auto-close after 10 seconds if user doesn't interact
            setTimeout(() => notification.close(), 10000)

            // Handle click - focus the window
            notification.onclick = () => {
                window.focus()
                notification.close()
            }
        } catch (error) {
            console.error('Error showing notification:', error)
        }
    }

    /**
     * Send a new order notification
     */
    async notifyNewOrder(orderData: {
        tableNumber: number
        customerName?: string
        totalAmount: number
        itemCount: number
    }): Promise<void> {
        const { tableNumber, customerName, totalAmount, itemCount } = orderData

        await this.notify('🔔 New Order Received!', {
            body: `Table ${tableNumber}${customerName ? ` - ${customerName}` : ''}\n${itemCount} item(s) • $${totalAmount.toFixed(2)}`,
            tag: 'new-order', // Replaces previous notification with same tag
            data: { type: 'new-order', tableNumber }
        })
    }
}

// Export singleton instance
export const pushNotifications = PushNotificationManager.getInstance()
