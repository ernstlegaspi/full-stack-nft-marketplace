'use client'

import { getAllUserNFTs } from "@/actions/nft"
import NFTCard from "@/components/NFTCard"
import { TDisplayedNFT } from "@/types"
import { useEffect, useState } from "react"

export default function Tokens() {
  const [nfts, setNFTs] = useState<TDisplayedNFT[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)

        const res = await getAllUserNFTs(1)

        setNFTs(res)
      } catch(e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const Skeleton = () => {
    const SkeletonCard = () => <div className='w-[250px] mt-10'>
      <div className='h-[250px] bg-gray-400 rounded'></div>

      <p className='rounded-full w-[60px] h-[20px] bg-gray-400 mt-5'></p>

      <p className='rounded-full w-full h-[20px] bg-gray-400 mt-5'></p>
      <p className='rounded-full w-full h-[20px] bg-gray-400 mt-2'></p>
      <p className='rounded-full w-full h-[20px] bg-gray-400 mt-2'></p>
    </div>
    
    return <div className="animate-pulse grid grid-cols-6 place-items-center -mt-10">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />

      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  }

  if(loading) return <Skeleton />
  if(nfts.length < 1) return <p>No current NFTs.</p>

  return <div className='grid gap-8 grid-repeat place-items-center max-[560px]:flex max-[560px]:flex-col max-[560px]:justify-center'>
    {
      nfts.map((nft, idx) => <NFTCard key={idx} nft={nft} />)
    }
  </div>
}
