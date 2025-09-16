'use client'

import { useState } from "react"

import { showMintModal } from "@/states/showMintModal"
import { useTokenState } from "@/states/token"
import { createContract } from "@/utils/nft"
import { useUserId } from "@/states/userId"

export default function HeaderButtons() {
  const { token, setToken } = useTokenState()
  const { setUserId } = useUserId()
  const { setIsShown } = showMintModal()

  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    try {
      setLoading(true)
      const { id, token } = await createContract()

      setUserId(id)
      setToken(token)
    } catch(e) {
      alert(1)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return <>
    {
      token ? <button
        aria-label='Mint NFT'
        className='button text-w bg-bb px-4 ml-2'
        onClick={async () => {
          setIsShown(true)
        }}
      >
        Mint NFT
      </button>
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
