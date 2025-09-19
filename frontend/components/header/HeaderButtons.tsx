'use client'

import Link from 'next/link'
import { useState } from "react"

import { showMintModal } from "@/states/showMintModal"
import { createContract } from "@/utils/nft"
import { useIsLoggedIn } from '@/states/isLoggedIn'

export default function HeaderButtons({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { setIsShown } = showMintModal()
  const { isLoggedIn, setIsLoggedIn } = useIsLoggedIn()

  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    try {
      setLoading(true)

      await createContract()

      setIsLoggedIn(true)
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return <>
    {
      isAuthenticated || isLoggedIn ? <>
        <button
          aria-label='Mint NFT'
          className='button text-w bg-bb px-4 ml-2'
          onClick={async () => {
            setIsShown(true)
          }}
        >
          Mint NFT
        </button>
        <Link className='button ml-2 transition-all hover:bg-bb hover:text-w select-none' href='/tokens'>Your Tokens</Link>
      </>
      : <button
        aria-label='Connect Wallet'
        className={`
          ${loading ? 'text-gray-300 border-gray-300' : 'border-bb text-bb hover:bg-bb hover:text-w'}
          transition-all bg-w button
        `}
        onClick={handleConnect}
      >
        { loading ? 'Connecting...' : 'Connect Wallet' }
      </button>
    }
  </>
}
