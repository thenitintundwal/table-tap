'use client'

import { useState } from 'react'
import { UtensilsCrossed, Plus, Search, Filter, Loader2, Edit2, Trash2, Power } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'
import { useCafe } from '@/hooks/useCafe'
import MenuForm, { MenuItemFormValues } from '@/components/dashboard/MenuForm'
import CafeGuard from '@/components/dashboard/CafeGuard'
import { MenuItem } from '@/types'
import { toast } from 'sonner'
import RecipeModal from './RecipeModal'

function MenuContent() {
    const { cafe } = useCafe()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
    const [recipeItem, setRecipeItem] = useState<MenuItem | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const { menuItems, isLoading: isMenuLoading, addItem, updateItem, deleteItem, uploadImage, categories } = useMenu(cafe?.id)

    const filteredItems = menuItems?.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleOpenAdd = () => {
        setEditingItem(null)
        setIsFormOpen(true)
    }

    const handleOpenEdit = (item: MenuItem) => {
        setEditingItem(item)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        toast.promise(deleteItem.mutateAsync(id), {
            loading: 'Deleting item...',
            success: 'Item deleted successfully',
            error: 'Failed to delete item'
        })
    }

    const handleToggleAvailability = async (item: MenuItem) => {
        const promise = updateItem.mutateAsync({
            id: item.id,
            is_available: !item.is_available
        })

        toast.promise(promise, {
            loading: 'Updating status...',
            success: `Item marked as ${!item.is_available ? 'Available' : 'Unavailable'}`,
            error: 'Failed to update status'
        })
    }

    const handleSubmit = async (values: MenuItemFormValues, imageFile?: File | null) => {
        try {
            let image_url = values.image_url

            if (imageFile) {
                image_url = await uploadImage.mutateAsync(imageFile)
            }

            const promise = editingItem
                ? updateItem.mutateAsync({ ...values, id: editingItem.id, image_url })
                : addItem.mutateAsync({ ...values, cafe_id: cafe?.id || '', image_url })

            toast.promise(promise, {
                loading: editingItem ? 'Updating item...' : 'Adding item...',
                success: editingItem ? 'Item updated successfully' : 'Item added successfully',
                error: (err) => `Error: ${err.message}`
            })

            await promise
            setIsFormOpen(false)
        } catch (error: any) {
            console.error('Submit failed:', error)
        }
    }

    if (isMenuLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 text-sm animate-pulse">Loading your menu...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Menu Items</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your cafe's categories and food items.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Add New Item
                </button>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 shadow-sm shadow-black/5 p-2 rounded-2xl border border-zinc-200/50 dark:border-white/10 transition-colors group">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-zinc-400 font-medium"
                    />
                </div>
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl text-zinc-400 hover:text-orange-500 transition-all border border-transparent hover:border-zinc-100 dark:hover:border-white/10">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                {filteredItems?.map((item) => (
                    <div key={item.id} className={`bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-orange-500/30 transition-all shadow-sm shadow-black/5 ${!item.is_available ? 'opacity-60' : ''}`}>
                        <div className="h-56 bg-zinc-50 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <UtensilsCrossed className="w-14 h-14 text-zinc-200 dark:text-zinc-700 group-hover:scale-110 transition-transform duration-500" />
                            )}
                            <div className="absolute top-5 right-5 bg-white/95 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-orange-600 border border-zinc-100 dark:border-white/10 shadow-lg shadow-black/5 tracking-widest">
                                ${item.price.toFixed(2)}
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={() => handleOpenEdit(item)}
                                    className="p-4 bg-white hover:bg-orange-500 hover:text-white rounded-2xl shadow-xl transition-all text-zinc-900 group/btn"
                                >
                                    <Edit2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-4 bg-white hover:bg-rose-500 hover:text-white rounded-2xl shadow-xl transition-all text-zinc-900 group/btn"
                                >
                                    <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="p-7">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-lg text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors line-clamp-1">{item.name}</h3>
                            </div>
                            <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]">{item.description}</p>

                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-[.2em] text-zinc-400 dark:text-zinc-500 font-black">{item.category}</span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleToggleAvailability(item)}
                                        className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${item.is_available
                                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                                            : 'text-zinc-400 bg-zinc-50 border-zinc-100 hover:bg-zinc-100'}`}
                                        title={item.is_available ? 'Available' : 'Unavailable'}
                                    >
                                        <Power className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setRecipeItem(item)}
                                        className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-100 text-orange-500 hover:bg-orange-100 rounded-xl transition-all group/recipe"
                                        title="View Recipe"
                                    >
                                        <UtensilsCrossed className="w-3.5 h-3.5 group-hover/recipe:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredItems?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] bg-zinc-50/50 dark:bg-transparent transition-all">
                        <UtensilsCrossed className="w-16 h-16 mb-6 opacity-20" />
                        <p className="text-xl font-bold tracking-tight">No menu items discovered</p>
                        <p className="text-sm mt-1 mb-8 opacity-60">Try adjusting your filters or search query.</p>
                        <button onClick={handleOpenAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[.2em] shadow-xl shadow-orange-500/20 active:scale-95 transition-all">Add Your First Item</button>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <MenuForm
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleSubmit}
                    initialData={editingItem}
                    categories={categories}
                />
            )}

            {recipeItem && (
                <RecipeModal
                    menuItem={recipeItem}
                    onClose={() => setRecipeItem(null)}
                />
            )}
        </div>
    )
}

export default function MenuPage() {
    return (
        <CafeGuard>
            <MenuContent />
        </CafeGuard>
    )
}
