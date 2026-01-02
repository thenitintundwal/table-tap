'use client'

import { useState } from 'react'
import { Star, X, Loader2, MessageSquare } from 'lucide-react'
import { useRatings, DishRating } from '@/hooks/useRatings'

interface RatingModalProps {
    isOpen: boolean
    onClose: () => void
    orderId: string
    items: {
        id: string
        name: string
        image_url?: string | null
    }[]
}

export default function RatingModal({ isOpen, onClose, orderId, items }: RatingModalProps) {
    const { submitRatings } = useRatings()
    const [ratings, setRatings] = useState<Record<string, { rating: number, comment: string }>>(
        Object.fromEntries(items.map(item => [item.id, { rating: 5, comment: '' }]))
    )

    if (!isOpen) return null

    const handleRatingChange = (itemId: string, value: number) => {
        setRatings(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], rating: value }
        }))
    }

    const handleCommentChange = (itemId: string, value: string) => {
        setRatings(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], comment: value }
        }))
    }

    const handleSubmit = async () => {
        const payload: DishRating[] = items.map(item => ({
            menu_item_id: item.id,
            order_id: orderId,
            rating: ratings[item.id].rating,
            comment: ratings[item.id].comment
        }))

        await submitRatings.mutateAsync(payload)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-white">Rate your dishes</h3>
                        <p className="text-zinc-400 text-sm mt-1">Help us improve with your feedback</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Items List */}
                <div className="max-h-[60vh] overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {items.map((item) => (
                        <div key={item.id} className="space-y-4">
                            <div className="flex items-center gap-4">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ring-1 ring-white/10">
                                        <MessageSquare className="w-5 h-5 text-zinc-500" />
                                    </div>
                                )}
                                <span className="font-semibold text-white">{item.name}</span>
                            </div>

                            <div className="flex flex-col gap-4 pl-16">
                                {/* Stars */}
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRatingChange(item.id, star)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= ratings[item.id].rating
                                                    ? 'fill-orange-500 text-orange-500'
                                                    : 'text-zinc-700'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Comment Field */}
                                <div className="relative group">
                                    <textarea
                                        placeholder="Add a comment (optional)..."
                                        value={ratings[item.id].comment}
                                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all resize-none h-24"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-zinc-900/50">
                    <button
                        onClick={handleSubmit}
                        disabled={submitRatings.isPending}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {submitRatings.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Submit Feedback'
                        )}
                    </button>
                    <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-widest font-bold">
                        Powered by TableTap
                    </p>
                </div>
            </div>
        </div>
    )
}
