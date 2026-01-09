'use client'

import { useState, useEffect } from 'react'
import { QrCode, Download, Printer, Plus, Trash2 } from 'lucide-react'
import QRCode from 'react-qr-code'
import CafeGuard from '@/components/dashboard/CafeGuard'
import { useCafe } from '@/hooks/useCafe'
import { useTables } from '@/hooks/useTables'

function QRCodeContent() {
    const { cafe } = useCafe()
    const { tables, isLoading } = useTables(cafe?.id)
    const [activeSection, setActiveSection] = useState<string>('all')
    const [origin, setOrigin] = useState('')

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const filteredTables = tables.filter(t =>
        activeSection === 'all' ? true : t.section === activeSection
    )

    const sections = ['all', ...Array.from(new Set(tables.map(t => t.section)))]

    const downloadSVG = (tableNumber: number, section: string) => {
        const id = `qr-table-${section}-${tableNumber}`
        const svg = document.getElementById(id)?.querySelector('svg')
        if (!svg) return
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)
        const downloadLink = document.createElement("a")
        downloadLink.href = svgUrl
        downloadLink.download = `table-${section}-${tableNumber}-qr.svg`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
    }

    const printQR = (tableNumber: number, section: string) => {
        const id = `qr-table-${section}-${tableNumber}`
        const svg = document.getElementById(id)?.querySelector('svg')
        if (!svg) return
        const printWindow = window.open('', '_blank')
        if (!printWindow) return
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Table ${tableNumber} QR</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: 'Inter', sans-serif; }
                        .container { text-align: center; border: 2px solid #000; padding: 60px; border-radius: 40px; }
                        svg { width: 400px; height: 400px; display: block; margin: 0 auto; }
                        h1 { margin: 30px 0 10px 0; font-size: 48px; font-weight: 900; color: #000; text-transform: uppercase; font-style: italic; }
                        p { color: #000; font-size: 24px; margin: 0; font-weight: 600; }
                        .footer { margin-top: 40px; font-size: 14px; color: #666; font-weight: 800; letter-spacing: 0.1em; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        ${svg.outerHTML}
                        <h1>Table ${tableNumber}</h1>
                        <p>${cafe?.name || 'TableTap'}</p>
                        <div class="footer">POWERED BY TABLETAP</div>
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    const printAll = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const qrsHtml = filteredTables.map(t => {
            const id = `qr-table-${t.section}-${t.table_number}`
            const svg = document.getElementById(id)?.querySelector('svg')
            if (!svg) return ''
            return `
                <div class="page-break">
                    <div class="container">
                        ${svg.outerHTML}
                        <h1>Table ${t.table_number}</h1>
                        <p>${cafe?.name || 'TableTap'}</p>
                        <div class="footer">${t.section.toUpperCase()} SECTION</div>
                    </div>
                </div>
            `
        }).join('')

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print All QR Codes</title>
                    <style>
                        body { margin: 0; font-family: 'Inter', sans-serif; }
                        .page-break { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; page-break-after: always; }
                        .container { text-align: center; border: 2px solid #000; padding: 60px; border-radius: 40px; width: 500px; }
                        svg { width: 400px; height: 400px; display: block; margin: 0 auto; }
                        h1 { margin: 30px 0 10px 0; font-size: 48px; font-weight: 900; color: #000; text-transform: uppercase; font-style: italic; }
                        p { color: #000; font-size: 24px; margin: 0; font-weight: 600; }
                        .footer { margin-top: 40px; font-size: 14px; color: #666; font-weight: 800; letter-spacing: 0.1em; }
                    </style>
                </head>
                <body>
                    ${qrsHtml}
                    <script>
                        window.onload = () => {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground italic uppercase">Table QR Codes</h1>
                    <p className="text-zinc-500 mt-1 font-medium">Generate and mass-print QR codes for your cafe tables.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={printAll}
                        disabled={filteredTables.length === 0}
                        className="bg-zinc-900 hover:bg-black disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-black/10 active:scale-95 uppercase italic text-xs tracking-widest"
                    >
                        <Printer className="w-5 h-5 text-orange-500" /> Print All ({filteredTables.length})
                    </button>
                </div>
            </div>

            {/* Section Filters */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-white/10 w-fit shadow-sm shadow-black/5">
                {sections.map((section) => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[.2em] transition-all ${activeSection === section
                            ? 'bg-zinc-900 text-white shadow-lg shadow-black/10'
                            : 'text-zinc-400 hover:text-orange-500 hover:bg-zinc-50 dark:hover:bg-white/5'
                            }`}
                    >
                        {section}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-80 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredTables.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center group relative hover:border-orange-500/30 transition-all shadow-sm shadow-black/5">
                            <div id={`qr-table-${t.section}-${t.table_number}`} className="bg-white p-6 rounded-[2rem] shadow-2xl mb-8 group-hover:scale-105 transition-all duration-700 border border-zinc-100">
                                {origin && (
                                    <QRCode
                                        value={`${origin}/menu/${cafe?.id}?table=${t.table_number}`}
                                        size={180}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                        level="H"
                                    />
                                )}
                            </div>

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-black text-foreground italic uppercase mb-2">Table {t.table_number}</h3>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-zinc-50 dark:bg-white/5 rounded-xl text-zinc-400 border border-zinc-100 dark:border-white/5">
                                        {t.section}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-zinc-50 dark:bg-white/5 rounded-xl text-zinc-400 border border-zinc-100 dark:border-white/5">
                                        {t.capacity} Seats
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full">
                                <button
                                    onClick={() => downloadSVG(t.table_number, t.section)}
                                    className="flex-1 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 p-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-zinc-100 dark:border-white/5 group/btn"
                                    title="Download SVG"
                                >
                                    <Download className="w-5 h-5 text-zinc-400 group-hover/btn:text-orange-500 transition-colors" />
                                </button>
                                <button
                                    onClick={() => printQR(t.table_number, t.section)}
                                    className="flex-1 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 p-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-zinc-100 dark:border-white/5 group/btn"
                                    title="Print QR"
                                >
                                    <Printer className="w-5 h-5 text-zinc-400 group-hover/btn:text-orange-500 transition-colors" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredTables.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-zinc-50/50 dark:bg-white/5 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-[3rem] animate-in fade-in duration-500">
                            <QrCode className="w-16 h-16 text-zinc-200 dark:text-zinc-800 mx-auto mb-6" />
                            <p className="text-zinc-500 text-xl font-black italic uppercase tracking-widest">No tables discovered</p>
                            <p className="text-zinc-400 text-sm mt-2">Try adjusting your section filters.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function QRPage() {
    return (
        <CafeGuard>
            <QRCodeContent />
        </CafeGuard>
    )
}
