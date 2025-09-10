'use client'

import { showMintModal } from "@/store/showMintModal"
import { checkEthConnection, createContract } from "@/utils/nft"

export default function HeaderButtons() {
  const { setIsShown } = showMintModal()

  const handleConnect = async () => {
    try {
      await createContract()
    } catch(e) {
			alert(1)
      console.error(e)
    }
  }

  return <>
    <button
      aria-label='Connect Wallet'
      className='transition-all bg-w button text-bb hover:bg-bb hover:text-w'
      onClick={handleConnect}
    >
      Connect Wallet
    </button>
    <button
      aria-label='Mint NFT'
      className="button text-w bg-bb px-4 ml-2"
      onClick={async () => {
        await checkEthConnection()
        // setIsShown(true)
      }}
    >
      Mint NFT
    </button>
  </>
}
