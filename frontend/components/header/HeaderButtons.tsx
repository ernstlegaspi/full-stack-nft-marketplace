'use client'

import { showMintModal } from "@/store/showMintModal"

export default function HeaderButtons() {
  const { setIsShown } = showMintModal()
  
  return <>
    <button aria-label='Connect Wallet' className='transition-all bg-w button text-bb hover:bg-bb hover:text-w'>
      Connect Wallet
    </button>
    <button
      aria-label='Mint NFT'
      className="button text-w bg-bb px-4 ml-2"
      onClick={() => {
        setIsShown(true)
      }}
    >
      Mint NFT
    </button>
  </>
}
