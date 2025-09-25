'use client'

import { useEffect, useState } from "react"

import NFTCard from "@/components/NFTCard"
import Skeleton from "@/components/SkeletonNFTCard"
import { TDisplayedNFT } from "@/types"
import { getAllUserNFTs } from "@/actions/nft"

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

  if(loading) return <Skeleton />
  if(nfts.length < 1) return <p>No current NFTs.</p>

  return <div className='grid gap-8 grid-repeat place-items-center max-[560px]:flex max-[560px]:flex-col max-[560px]:justify-center'>
    {
      nfts.map((nft, idx) => <NFTCard key={idx} nft={nft} />)
    }
  </div>
}
