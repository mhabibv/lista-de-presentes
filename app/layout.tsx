import './globals.css'
import localFont from 'next/font/local'
import { Montserrat } from 'next/font/google' 

const minhaFonteCustom = localFont({
  src: './fonts/Slight-Regular-1.ttf', 
  variable: '--font-custom',
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" className={`${minhaFonteCustom.variable} ${montserrat.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}