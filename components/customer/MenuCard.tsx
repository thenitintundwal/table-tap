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
            <div className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 ${!item.is_available ? 'grayscale opacity-75' : ''}`}>
                <div className="h-40 bg-zinc-800 relative overflow-hidden group">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 group-hover:scale-110 transition-transform duration-700">
                            <Info className="w-12 h-12" />
                        </div>
                    )}
                    {!item.is_available && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-black/40 border border-white/20 text-white text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl backdrop-blur-md">
                                Not Available
                            </span>
                        </div>
                    )}
                    <div className="absolute top-4 right-4 bg-orange-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg z-10">
                        ${item.price.toFixed(2)}
                    </div>
                </div>

                <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-500 transition-colors">{item.name}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-2 min-h-[40px] mb-4">{item.description}</p>

                    <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-zinc-500 font-bold uppercase tracking-widest leading-none border border-white/5">
                            {item.category}
                        </span>

                        <button
                            onClick={() => count > 0 && setShowReviews(true)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${count > 0
                                    ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
                                    : 'bg-white/5 text-zinc-600 cursor-default'
                                }`}
                        >
                            <Star className={`w-3.5 h-3.5 ${count > 0 ? 'fill-current' : ''}`} />
                            <span className="text-xs font-black">{average > 0 ? average.toFixed(1) : 'New'}</span>
                            {count > 0 && (
                                <>
                                    <span className="text-[10px] opacity-40">|</span>
                                    <MessageCircle className="w-3 h-3 opacity-40" />
                                    <span className="text-[10px] font-bold">{count}</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                        {quantity > 0 && item.is_available ? (
                            <>
                                <button
                                    onClick={onRemove}
                                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 border border-white/5"
                                >
                                    <Minus className="w-4 h-4 text-white" />
                                </button>
                                <span className="text-lg font-bold text-orange-500 min-w-[20px] text-center">{quantity}</span>
                            </>
                        ) : null}
                        <button
                            onClick={onAdd}
                            disabled={!item.is_available}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${item.is_available
                                ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                                : 'bg-white/5 cursor-not-allowed opacity-50'
                                }`}
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </button>
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
