import { useState } from 'react'
import { MenuItem } from '@/types'
import { Plus, Minus, Info, Star, MessageCircle } from 'lucide-react'
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
            <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-row h-36 w-[340px] flex-shrink-0 snap-center ${!item.is_available ? 'grayscale opacity-75' : ''}`}>
                <div className="w-36 h-full bg-zinc-800 relative overflow-hidden group flex-shrink-0">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 group-hover:scale-110 transition-transform duration-700">
                            <Info className="w-8 h-8" />
                        </div>
                    )}
                    {!item.is_available && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-black/40 border border-white/20 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg backdrop-blur-md">
                                Out
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-white truncate group-hover:text-orange-500 transition-colors leading-tight">{item.name}</h3>
                            <span className="text-orange-500 font-bold text-sm whitespace-nowrap">
                                ${item.price.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-zinc-500 text-[11px] line-clamp-1 mt-0.5">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={() => count > 0 && setShowReviews(true)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors ${count > 0
                                ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
                                : 'bg-white/5 text-zinc-600 cursor-default'
                                }`}
                        >
                            <Star className={`w-3 h-3 ${count > 0 ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-black">{average > 0 ? average.toFixed(1) : 'New'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                            {quantity > 0 && item.is_available ? (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 border border-white/5"
                                    >
                                        <Minus className="w-3.5 h-3.5 text-white" />
                                    </button>
                                    <span className="text-sm font-bold text-orange-500 min-w-[16px] text-center">{quantity}</span>
                                </>
                            ) : null}
                            <button
                                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                disabled={!item.is_available}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${item.is_available
                                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                                    : 'bg-white/5 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <Plus className="w-4 h-4 text-white" />
                            </button>
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
