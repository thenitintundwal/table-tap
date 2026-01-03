import { useState } from 'react'
import { MenuItem } from '@/types'
import { Plus, Minus, Star } from 'lucide-react'
import { useItemStats } from '@/hooks/useRatings'
import ItemReviewsModal from './ItemReviewsModal'

interface MenuCardProps {
    item: MenuItem
    onAdd: () => void
    onRemove: () => void
    quantity: number
}

export default function MenuCard({ item, onAdd, onRemove, quantity }: MenuCardProps) {
    const { data: stats } = useItemStats(item.id)
    const [showReviews, setShowReviews] = useState(false)

    const average = stats?.average || 0
    const count = stats?.count || 0

    return (
        <>
            <div className="flex justify-between gap-4 py-6 border-b border-white/5 last:border-0 group bg-transparent">
                {/* Left Side: Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-zinc-800 border border-white/5">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-white/5">
                                <span className="text-xs">No Image</span>
                            </div>
                        )}
                        {!item.is_available && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2 sm:py-1 border border-white/20 rounded-lg bg-black/40">
                                    Sold Out
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Content & Actions */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-orange-500 transition-colors leading-tight">{item.name}</h3>
                        </div>

                        <p className="text-zinc-500 text-xs sm:text-sm line-clamp-2 leading-relaxed mt-1 mb-2 sm:mb-3">{item.description}</p>

                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-sm sm:text-base">
                                ${item.price.toFixed(2)}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); count > 0 && setShowReviews(true); }}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${count > 0
                                    ? 'bg-green-900/40 text-green-400'
                                    : 'bg-white/5 text-zinc-500 cursor-default'
                                    }`}
                            >
                                <Star className={`w-3 h-3 ${count > 0 ? 'fill-current' : ''}`} />
                                <span className="text-[10px] font-bold">{average > 0 ? average.toFixed(1) : 'No ratings'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Add Button Area on the Right */}
                    <div className="flex justify-end mt-2">
                        <div className="w-24">
                            {quantity > 0 && item.is_available ? (
                                <div className="flex items-center justify-between bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden h-9">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                        className="w-8 h-full flex items-center justify-center hover:bg-white/5 text-white active:bg-white/10 transition-colors"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="font-bold text-orange-500 text-sm">{quantity}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                        className="w-8 h-full flex items-center justify-center hover:bg-white/5 text-white active:bg-white/10 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                    disabled={!item.is_available}
                                    className={`w-full bg-white text-black font-extrabold text-sm py-2 rounded-lg shadow-lg shadow-black/20 uppercase tracking-wide hover:bg-zinc-100 active:scale-95 transition-all ${!item.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Add
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showReviews && (
                <ItemReviewsModal
                    isOpen={showReviews}
                    onClose={() => setShowReviews(false)}
                    item={item}
                />
            )}
        </>
    )
}
