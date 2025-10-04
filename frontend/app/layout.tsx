import type { Metadata } from "next"

import "./globals.css"

import dynamic from "next/dynamic"

import Header from "@/components/header"
import { useCookies } from "@/utils"

const Modal = dynamic(() => import('@/components/modal/Modal'))

export const metadata: Metadata = {
  title: "NFT Marketplace",
  description: "Mint and Burn your NFT Here!",
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated } = await useCookies()

  return <html lang="en">
    <body className='antialiased bg-w min-h-screen'>
      { isAuthenticated ? <Modal /> : null }

      <Header isAuthenticated={isAuthenticated} />

      <div className='w-[95%] mx-auto relative z-10'>
        {children}
      </div>
    </body>
  </html>
}
