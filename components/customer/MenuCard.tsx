import { useState } from 'react'
import { MenuItem } from '@/types'
import { Plus, Minus, Info, Star } from 'lucide-react'
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
            <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-row h-40 w-full sm:w-[400px] flex-shrink-0 snap-center group ${!item.is_available ? 'grayscale opacity-75' : ''}`}>
                {/* Image Section */}
                <div className="w-40 h-full bg-zinc-800 relative overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 group-hover:scale-110 transition-transform duration-700">
                            <Info className="w-10 h-10" />
                        </div>
                    )}
                    {!item.is_available && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center">
                            <span className="bg-black/40 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl backdrop-blur-md">
                                Sold Out
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0 bg-gradient-to-br from-white/[0.02] to-transparent">
                    <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-black text-white truncate group-hover:text-orange-500 transition-colors leading-tight italic uppercase tracking-tighter">{item.name}</h3>
                        </div>
                        <p className="text-zinc-500 text-[11px] line-clamp-2 font-medium leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                        <div className="flex flex-col">
                            <span className="text-orange-500 font-black text-xl italic tracking-tighter">
                                ${item.price.toFixed(2)}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); count > 0 && setShowReviews(true); }}
                                className={`flex items-center gap-1 mt-1 transition-colors ${count > 0
                                    ? 'text-orange-500/60 hover:text-orange-500'
                                    : 'text-zinc-700 cursor-default'
                                    }`}
                            >
                                <Star className={`w-3 h-3 ${count > 0 ? 'fill-current' : ''}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{average > 0 ? average.toFixed(1) : 'New'}</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2.5">
                            {quantity > 0 && item.is_available ? (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                        className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 border border-white/5 shadow-inner"
                                    >
                                        <Minus className="w-4 h-4 text-white" />
                                    </button>
                                    <span className="text-base font-black text-orange-500 min-w-[20px] text-center italic">{quantity}</span>
                                </>
                            ) : null}
                            <button
                                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                disabled={!item.is_available}
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 border-t border-white/20 ${item.is_available
                                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                                    : 'bg-white/5 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <Plus className="w-6 h-6 text-white" />
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
