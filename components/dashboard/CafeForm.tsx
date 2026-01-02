'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Store, X } from 'lucide-react'

const cafeSchema = z.object({
    name: z.string().min(1, 'Cafe Name is required'),
    description: z.string().optional(),
})

type CafeFormValues = z.infer<typeof cafeSchema>

interface CafeFormProps {
    onSubmit: (values: CafeFormValues) => Promise<void>
    onClose?: () => void
    initialData?: Partial<CafeFormValues>
    title?: string
}

export default function CafeForm({ onSubmit, onClose, initialData, title = 'Setup Your Cafe' }: CafeFormProps) {
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CafeFormValues>({
        resolver: zodResolver(cafeSchema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
        },
    })

    const handleFormSubmit: SubmitHandler<CafeFormValues> = async (data) => {
        setLoading(true)
        try {
            await onSubmit(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 sm:p-12">
            <div className="flex flex-col items-center text-center mb-10">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-6">
                    <Store className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter italic whitespace-nowrap">
                    {title}
                </h2>
                <p className="text-zinc-500 text-sm mt-2">
                    Enter your cafe details to get started with TableTap.
                </p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Cafe Name</label>
                    <input
                        {...register('name')}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-700"
                        placeholder="e.g. The Coffee Lab"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1 ml-2">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Description</label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-700 resize-none"
                        placeholder="Tell your customers about your cafe..."
                    />
                </div>

                <div className="pt-4 flex gap-4">
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl py-4 font-bold transition-all"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Create Cafe'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
