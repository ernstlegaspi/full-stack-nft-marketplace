'use client'

import Link from 'next/link'
import { useState } from "react"
import { IoMenu } from "react-icons/io5"

import { showMintModal } from "@/states/showMintModal"
import { createContract } from "@/utils/nft"
import { useRouter } from 'next/navigation'

export default function HeaderButtons({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter()
  const { setIsShown } = showMintModal()

  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleConnect = async () => {
    try {
      setLoading(true)

      await createContract()
      router.refresh()
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return <>
    <div className='hidden mt-1 max-[780px]:block'>
      <IoMenu onClick={() => {
        setShowMenu(prev => !prev)
      }} size={24} />

      {
        showMenu ? <div className='bshadow bg-white rounded-[2px] mt-1 w-[250px] absolute right-5'>
          {
            isAuthenticated ? <>
              <button
                aria-label='Mint NFT'
                className='bg-bb text-white pointer w-full py-3'
                onClick={async () => {
                  setIsShown(true)
                }}
              >
                Mint NFT
              </button>

              <Link className='bg-bb text-white pointer w-full py-3 block text-center' href='/tokens'>
                Your Tokens
              </Link>
            </> : <>
              <button
                aria-label='Connect Wallet'
                className={`
                  ${loading ? 'text-gray-300 border-gray-300' : 'bg-bb text-white pointer w-full py-3 text-center'}
                  transition-all
                `}
                onClick={handleConnect}
              >
                { loading ? 'Connecting...' : 'Connect Wallet' }
              </button>
            </>
          }
        </div>
        : null
      }
    </div>
  
    {
      isAuthenticated ? <div className='relative'>
        <div className='max-[780px]:hidden'>
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
        </div>
      </div>
      : <button
        aria-label='Connect Wallet'
        className={`
          ${loading ? 'text-gray-300 border-gray-300' : 'border-bb text-bb hover:bg-bb hover:text-w'}
          transition-all bg-w button max-[780px]:hidden
        `}
        onClick={handleConnect}
      >
        { loading ? 'Connecting...' : 'Connect Wallet' }
      </button>
    }
  </>
}
