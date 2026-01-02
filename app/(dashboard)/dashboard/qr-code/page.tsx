'use client'

import { useState, useEffect } from 'react'
import { QrCode, Download, Printer, Plus, Trash2 } from 'lucide-react'
import QRCode from 'react-qr-code'
import CafeGuard from '@/components/dashboard/CafeGuard'
import { useCafe } from '@/hooks/useCafe'

function QRCodeContent() {
    const { cafe } = useCafe()
    const [tableCount, setTableCount] = useState(5)
    const [origin, setOrigin] = useState('')

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const addTable = () => {
        setTableCount(prev => prev + 1)
    }

    const removeTable = () => {
        if (tableCount > 0) {
            setTableCount(prev => prev - 1)
        }
    }

    const downloadSVG = (table: number) => {
        const svg = document.getElementById(`qr-table-${table}`)?.querySelector('svg')
        if (!svg) return
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)
        const downloadLink = document.createElement("a")
        downloadLink.href = svgUrl
        downloadLink.download = `table-${table}-qr.svg`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
    }

    const printQR = (table: number) => {
        const svg = document.getElementById(`qr-table-${table}`)?.querySelector('svg')
        if (!svg) return
        const printWindow = window.open('', '_blank')
        if (!printWindow) return
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Table ${table} QR</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                        .container { text-align: center; border: 1px solid #eee; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                        svg { width: 300px; height: 300px; display: block; margin: 0 auto; }
                        h1 { margin: 20px 0 5px 0; font-size: 32px; font-weight: 800; color: #000; }
                        p { color: #666; font-size: 16px; margin: 0; font-weight: 500; }
                        .footer { margin-top: 30px; font-size: 12px; color: #999; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        ${svg.outerHTML}
                        <h1>Table ${table}</h1>
                        <p>${cafe?.name || 'Scan to view menu'}</p>
                        <div class="footer">Generate by Cafe QR System</div>
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

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
                    <p className="text-zinc-500 mt-1">Generate and manage QR codes for your tables.</p>
                </div>
                <button
                    onClick={addTable}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Add Table
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: tableCount }, (_, i) => i + 1).map((table) => (
                    <div key={table} className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center group relative hover:bg-white/[0.07] transition-all">
                        <div id={`qr-table-${table}`} className="bg-white p-4 rounded-2xl shadow-xl mb-6 group-hover:scale-105 transition-transform duration-500">
                            {origin && (
                                <QRCode
                                    value={`${origin}/menu/${cafe?.id}?table=${table}`}
                                    size={160}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            )}
                        </div>

                        <h3 className="text-xl font-bold mb-1">Table {table}</h3>
                        <p className="text-zinc-500 text-sm mb-6 font-mono">T-00{table}</p>

                        <div className="flex items-center gap-3 w-full">
                            <button
                                onClick={() => downloadSVG(table)}
                                className="flex-1 bg-white/5 hover:bg-white/10 p-2 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5"
                            >
                                <Download className="w-4 h-4 text-zinc-400" />
                                <span className="text-xs font-semibold">SVG</span>
                            </button>
                            <button
                                onClick={() => printQR(table)}
                                className="flex-1 bg-white/5 hover:bg-white/10 p-2 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5"
                            >
                                <Printer className="w-4 h-4 text-zinc-400" />
                                <span className="text-xs font-semibold">Print</span>
                            </button>
                            <button
                                onClick={removeTable}
                                className="p-2 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 rounded-xl transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function QRCodePage() {
    return (
        <CafeGuard>
            <QRCodeContent />
        </CafeGuard>
    )
}
