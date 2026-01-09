'use client'

import { useState } from 'react'
import { useInventory } from '@/hooks/useInventory'
import { useRecipes } from '@/hooks/useRecipes'
import {
    X,
    Plus,
    Trash2,
    Save,
    Scale,
    Loader2,
    UtensilsCrossed
} from 'lucide-react'
import { MenuItem } from '@/types'
import { toast } from 'sonner'

interface RecipeModalProps {
    menuItem: MenuItem
    onClose: () => void
}

export default function RecipeModal({ menuItem, onClose }: RecipeModalProps) {
    const { items: inventoryItems, isLoading: inventoryLoading } = useInventory(menuItem.cafe_id)
    const { ingredients, isLoading: recipeLoading, addIngredient, removeIngredient } = useRecipes(menuItem.id)

    const [newIngredient, setNewIngredient] = useState({
        inventory_item_id: '',
        quantity_required: 0
    })

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newIngredient.inventory_item_id) return

        try {
            await addIngredient({
                menu_item_id: menuItem.id,
                inventory_item_id: newIngredient.inventory_item_id,
                quantity_required: newIngredient.quantity_required
            })
            setNewIngredient({ inventory_item_id: '', quantity_required: 0 })
        } catch (error) {
            console.error(error)
        }
    }

    const isLoading = inventoryLoading || recipeLoading

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/40 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 relative z-10 animate-in fade-in zoom-in-95 shadow-2xl shadow-black/10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-foreground flex items-center gap-3 italic uppercase tracking-tight">
                            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                            Recipe: {menuItem.name}
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1 font-medium">Configure ingredients for automated stock deduction.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-full transition-all">
                        <X className="w-6 h-6 text-zinc-400" />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Add New Ingredient */}
                    <form onSubmit={handleAdd} className="grid grid-cols-12 gap-4 items-end bg-zinc-50 dark:bg-white/5 p-6 rounded-3xl border border-zinc-100 dark:border-white/5">
                        <div className="col-span-12 md:col-span-6 space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Ingredient</label>
                            <select
                                required
                                value={newIngredient.inventory_item_id}
                                onChange={e => setNewIngredient({ ...newIngredient, inventory_item_id: e.target.value })}
                                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-foreground dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.75em_0.75em] bg-[right_1rem_center] bg-no-repeat shadow-sm"
                            >
                                <option value="" className="bg-white dark:bg-zinc-900">Select Ingredient</option>
                                {inventoryItems.map(item => (
                                    <option key={item.id} value={item.id} className="bg-white dark:bg-zinc-900">{item.item_name} ({item.unit})</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-12 md:col-span-4 space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Qty Required</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    step="0.001"
                                    min="0.001"
                                    value={newIngredient.quantity_required || ''}
                                    onChange={e => setNewIngredient({ ...newIngredient, quantity_required: parseFloat(e.target.value) })}
                                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-foreground dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3.5 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </form>

                    {/* Ingredients List */}
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                            </div>
                        ) : ingredients.length > 0 ? (
                            ingredients.map(ing => (
                                <div key={ing.id} className="flex items-center justify-between bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 p-4 rounded-2xl group hover:border-orange-500/20 transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                            <Scale className="w-6 h-6 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-foreground dark:text-white font-bold">{ing.inventory_item?.item_name}</p>
                                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                                {ing.quantity_required} {ing.inventory_item?.unit}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeIngredient(ing.id)}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[2.5rem]">
                                <UtensilsCrossed className="w-16 h-16 text-zinc-100 dark:text-zinc-800 mx-auto mb-4" />
                                <p className="text-zinc-500 font-black italic uppercase tracking-widest">No ingredients discovered</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full bg-zinc-900 dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-700 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-black/10 transition-all active:scale-95 italic"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
