'use client'

import { useState } from 'react'
import { UtensilsCrossed, Plus, Search, Filter, Loader2, Edit2, Trash2, Power } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'
import { useCafe } from '@/hooks/useCafe'
import MenuForm, { MenuItemFormValues } from '@/components/dashboard/MenuForm'
import CafeGuard from '@/components/dashboard/CafeGuard'
import { MenuItem } from '@/types'
import { toast } from 'sonner'

function MenuContent() {
    const { cafe } = useCafe()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
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

            <div className="flex items-center gap-4 bg-zinc-100 dark:bg-white/5 p-2 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 pl-10 pr-4 py-2 text-sm text-foreground dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
                    />
                </div>
                <button className="p-2 hover:bg-zinc-200 dark:hover:bg-white/5 rounded-xl text-zinc-400 hover:text-foreground dark:hover:text-white transition-all border border-transparent hover:border-zinc-30 dark:hover:border-white/10">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems?.map((item) => (
                    <div key={item.id} className={`bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden group hover:border-orange-500/30 transition-all shadow-sm dark:shadow-none ${!item.is_available ? 'opacity-60' : ''}`}>
                        <div className="h-48 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <UtensilsCrossed className="w-12 h-12 text-zinc-300 dark:text-zinc-700 group-hover:scale-110 transition-transform duration-500" />
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-orange-600 dark:text-orange-500 border border-zinc-200 dark:border-white/10 shadow-sm">
                                ${item.price.toFixed(2)}
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleOpenEdit(item)}
                                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md border border-white/20 transition-all text-white"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-full backdrop-blur-md border border-red-500/20 transition-all text-red-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">{item.name}</h3>
                            </div>
                            <p className="text-zinc-500 text-sm line-clamp-2">{item.description}</p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600 font-bold">{item.category}</span>
                                <button
                                    onClick={() => handleToggleAvailability(item)}
                                    className={`flex items-center gap-2 text-xs transition-colors ${item.is_available ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-400 dark:text-zinc-500'}`}
                                >
                                    <Power className="w-3 h-3" />
                                    {item.is_available ? 'Available' : 'Unavailable'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredItems?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-3xl">
                        <UtensilsCrossed className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg">No menu items found</p>
                        <button onClick={handleOpenAdd} className="mt-4 text-orange-500 hover:text-orange-400 font-medium">Add your first item</button>
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
