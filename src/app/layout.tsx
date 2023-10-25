
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import netlifyIdentity from 'netlify-identity-widget';
import MyApp from './__MyApp';
import localFont from 'next/font/local'
const me = localFont({
  src: [
    {
      path: '../fonts/Estedad-Thin.woff2',
      weight: '100'
    },
    {
      path: '../fonts/Estedad-ExtraLight.woff2',
      weight: '200'
    },
    {
      path: '../fonts/Estedad-Light.woff2',
      weight: '300'
    },
    {
      path: '../fonts/Estedad-Regular.woff2',
      weight: '400'
    },
    {
      path: '../fonts/Estedad-Medium.woff2',
      weight: '500'
    },
    {
      path: '../fonts/Estedad-SemiBold.woff2',
      weight: '600'
    },
    {
      path: '../fonts/Estedad-Bold.woff2',
      weight: '700'
    },
    {
      path: '../fonts/Estedad-ExtraBold.woff2',
      weight: '800'
    },
    {
      path: '../fonts/Estedad-Black.woff2',
      weight: '900'
    },
  ],
  variable: '--font-mers'
})

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
    <MyApp>
      <html lang="en">
        <body className={`${inter.className} bg-slate-800 text-white`}>{children}</body>
      </html>
    </MyApp>
  )
}
