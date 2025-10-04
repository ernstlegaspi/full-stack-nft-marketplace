import Link from 'next/link'

import { useState } from 'react'
import { ethers } from 'ethers'

import { TDisplayedNFT } from '@/types'
import { burnNFT } from '@/actions/nft'
import { deleteFileOnPinata } from '@/actions/pinata'

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
    tokenId
  } = nft
  const [loading, setLoading] = useState(false)

  const isOwner = userAddress == ownerAddress
  const modifiedDescription = description.slice(0, 45)

  const onClick = async () => {
    try {
      if(!contract) throw new Error('Error burning token. Try again later.')

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
      </button> : null
    }
  </div>
}
