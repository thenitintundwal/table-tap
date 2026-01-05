'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus, Image as ImageIcon, X, Trash2 } from 'lucide-react'
import { MenuItem } from '@/types'

const menuItemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string(),
    price: z.number().min(0, 'Price must be positive'),
    category: z.string().min(1, 'Category is required'),
    is_available: z.boolean(),
    image_url: z.string(),
})

export type MenuItemFormValues = z.infer<typeof menuItemSchema>

interface MenuFormProps {
    onSubmit: (values: MenuItemFormValues, imageFile?: File | null) => Promise<void>
    initialData?: MenuItem | null
    categories?: string[]
    onClose: () => void
}

export default function MenuForm({ onSubmit, initialData, categories = [], onClose }: MenuFormProps) {
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)

    const defaultValues = useMemo(() => ({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || 0,
        category: initialData?.category || '',
        is_available: initialData?.is_available ?? true,
        image_url: initialData?.image_url || '',
    }), [initialData])

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<MenuItemFormValues>({
        resolver: zodResolver(menuItemSchema),
        defaultValues,
    })

    useEffect(() => {
        reset(defaultValues)
    }, [defaultValues, reset])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        setImageFile(null)
        setImagePreview(null)
    }

    const handleFormSubmit: SubmitHandler<MenuItemFormValues> = async (data) => {
        setLoading(true)
        try {
            await onSubmit(data, imageFile)
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? 'Edit Menu Item' : 'Add New Item'}
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Item Photo</label>
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => document.getElementById('image-upload')?.click()}
                        >
                            <div className="w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 overflow-hidden hover:border-orange-500/50 transition-all">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium">Click to upload photo</p>
                                    </>
                                )}
                            </div>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Item Name</label>
                        <input
                            {...register('name')}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600"
                            placeholder="Caramel Macchiato"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600 resize-none"
                            placeholder="Rich espresso with creamy milk and caramel drizzle..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('price', { valueAsNumber: true })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600"
                                placeholder="4.50"
                            />
                            {errors.price && <p className="text-red-400 text-xs mt-1 ml-1">{errors.price.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Category</label>
                            <div className="relative">
                                <input
                                    {...register('category')}
                                    list="categories-list"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600"
                                    placeholder="Select or type..."
                                />
                                <datalist id="categories-list">
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            </div>
                            {errors.category && <p className="text-red-400 text-xs mt-1 ml-1">{errors.category.message}</p>}

                            {categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {categories.slice(0, 6).map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setValue('category', cat, { shouldValidate: true })}
                                            className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500 text-zinc-400 hover:text-white transition-all border border-white/5"
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                        <input
                            type="checkbox"
                            id="is_available"
                            {...register('is_available')}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-orange-500 focus:ring-orange-500/50"
                        />
                        <label htmlFor="is_available" className="text-sm font-medium text-zinc-300 cursor-pointer">
                            Available for order
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-4 font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {initialData ? 'Update Item' : 'Create Item'}
                                <Plus className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
