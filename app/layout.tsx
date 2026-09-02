import { Geist, Geist_Mono, DM_Serif_Display } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-dm-serif' })

export const metadata: Metadata = { title: 'Health & Safety Companion', description: 'Calm, clear first-aid guidance for campus emergencies and safety hazards.' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f4f1e8', userScalable: true }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className={`${geist.variable} ${geistMono.variable} ${dmSerif.variable}`}>{children}</body></html>
}
