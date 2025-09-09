import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "NFT Marketplace",
  description: "Mint and Burn your NFT Here!",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en">
    <body className='antialiased'>
      {children}
    </body>
  </html>
}
