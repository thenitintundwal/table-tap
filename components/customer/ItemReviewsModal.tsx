'use client'

import { Star, X, MessageSquare, Loader2 } from 'lucide-react'
import { useItemRatings, useItemStats } from '@/hooks/useRatings'
import { formatDistanceToNow } from 'date-fns'

interface ItemReviewsModalProps {
    isOpen: boolean
    onClose: () => void
    item: {
        id: string
        name: string
        image_url?: string | null
    }
}

export default function ItemReviewsModal({ isOpen, onClose, item }: ItemReviewsModalProps) {
    const { data: reviews, isLoading: isLoadingReviews } = useItemRatings(item.id)
    const { data: stats } = useItemStats(item.id)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative bg-zinc-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                    <div className="flex items-center gap-4">
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-14 h-14 rounded-2xl object-cover ring-1 ring-white/10 shadow-xl"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ring-1 ring-white/10">
                                <MessageSquare className="w-6 h-6 text-zinc-500" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex text-orange-500">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`w-3 h-3 ${s <= Math.round(stats?.average || 0) ? 'fill-current' : 'opacity-20'}`} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    {stats?.average?.toFixed(1) || '0.0'} ({stats?.count || 0} reviews)
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/5 rounded-full transition-colors group"
                    >
                        <X className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Reviews Content */}
                <div className="max-h-[60vh] overflow-y-auto p-8 space-y-8 custom-scrollbar bg-black/20">
                    {isLoadingReviews ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Loading Thoughts...</p>
                        </div>
                    ) : reviews && reviews.length > 0 ? (
                        reviews.map((review, i) => (
                            <div key={i} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1 text-orange-500">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-current' : 'opacity-20'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                                        {review.created_at ? formatDistanceToNow(new Date(review.created_at), { addSuffix: true }) : 'Recently'}
                                    </span>
                                </div>
                                {review.comment ? (
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl relative">
                                        <p className="text-sm text-zinc-300 leading-relaxed font-medium">"{review.comment}"</p>
                                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-600 italic font-medium">Rated without comment</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-800">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold opacity-50">No reviews yet</h4>
                                <p className="text-zinc-600 text-xs mt-1">Be the first to share your thoughts!</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl transition-all active:scale-[0.98] border border-white/5"
                    >
                        Return to Menu
                    </button>
                    <p className="text-center text-[8px] text-zinc-700 mt-6 uppercase tracking-[.3em] font-black italic">
                        Real Feedback • Verified Orders
                    </p>
                </div>
            </div>
        </div>
    )
}
