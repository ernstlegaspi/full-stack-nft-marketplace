import Link from 'next/link'

import { useState } from 'react'
import { ethers } from 'ethers'

import { TDisplayedNFT } from '@/types'
import { burnNFT, buyNFT } from '@/actions/nft'
import { deleteFileOnPinata } from '@/actions/pinata'
import { isEip1193 } from '@/utils/nft'

export default function NFTCard({ contract, nft, userAddress }: { contract: ethers.Contract, nft: TDisplayedNFT, userAddress: string }) {
  const {
    _id,
    backgroundColor,
    description,
    imageUrl,
    metadataUrl,
    name,
    nameSlug,
    ownerAddress,
    price,
    tokenId
  } = nft
  const [loading, setLoading] = useState(false)

  const isOwner = userAddress == ownerAddress
  const modifiedDescription = description.slice(0, 45)

  const onClick = async () => {
    try {
      if(!contract) throw new Error('Error burning token. Try again later.')

      setLoading(true)

      await contract.burnNFT(tokenId)
      await burnNFT(_id)
      await deleteFileOnPinata(imageUrl, metadataUrl)

    } catch(e) {
      console.error(e)
      alert('Error burning token. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async () => {
    try {
      setLoading(true)

      if(typeof window === 'undefined' || !isEip1193(window.ethereum)) {
        alert('Please download and install MetaMask to proceed.')
        return
      }

      const eth = window.ethereum
      const provider =  new ethers.BrowserProvider(eth)
      const accounts = await eth.request({ method: 'eth_accounts' })
      const user = accounts[0]

      if(!user || accounts.length < 1) {
        alert('Please login to MetaMask first.')
        return
      }

      const weiBalance = await provider.getBalance(accounts[0])
      const userBalance = parseFloat(ethers.formatUnits(weiBalance, 'ether'))
      const tokenPrice = parseFloat(ethers.formatUnits(price, 'ether'))

      if(!(userBalance > 0) || userBalance < tokenPrice) {
        alert('You do not have a balance.')
        return
      }

      await contract.buyNFT(tokenId, { value: BigInt(price) })
      await buyNFT(tokenId)

      alert('Token bought')
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return <div className='w-max relative'>
    <Link href={`/token/${nameSlug}`}>
      <div className='text-bb h-[400px] p-3 w-[250px] border border-g bg-white rounded'>
        <div className='w-full h-[250px] relative overflow-hidden'>
          <div className='absolute z-[1] size-full' style={{ background: backgroundColor }}></div>

          <img
            alt={name}
            src={`https://ipfs.io/ipfs/${imageUrl}`}
            className='relative z-[2] size-full rounded'
          />
        </div>

        <p className='font-medium mt-2'>{name}</p>

        <p>{modifiedDescription}...</p>
      </div>
    </Link>

    {
      isOwner ? <button
        aria-label={loading ? 'Burning ...' : 'Burn Token'}
        className='absolute bg-red-400 text-white rounded-[2px] p-1 px-2 mt-[-45px] pointer right-4 transition-all hover:bg-red-600'
        onClick={onClick}
      >
        { loading ? 'Burning...' : 'Burn Token' }
      </button> : <button
        aria-label={loading ? 'Loading...' : 'Buy Token'}
        className='absolute bg-blue-400 text-white rounded-[2px] p-1 px-2 mt-[-45px] pointer right-4 transition-all hover:bg-blue-600'
        onClick={handleBuy}
      >
        { loading ? 'Loading...' : 'Buy Token' }
      </button>
    }
  </div>
}
