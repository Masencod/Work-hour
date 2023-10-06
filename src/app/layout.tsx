'use client'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import netlifyIdentity from 'netlify-identity-widget';
import { RecoilRoot } from 'recoil';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Work-Hour App',
  description: 'made by sajjad (Masencod)',
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <RecoilRoot>
      <html lang="en">
        <body className={`${inter.className} bg-slate-800 text-white`}>{children}</body>
      </html>
    </RecoilRoot>
  )
}
