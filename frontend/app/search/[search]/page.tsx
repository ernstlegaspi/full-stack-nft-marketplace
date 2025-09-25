'use client'

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { getNFTsBySearch } from "@/actions/nft"
import { TDisplayedNFT } from "@/types"
import Skeleton from "@/components/SkeletonNFTCard"
import NFTCard from "@/components/NFTCard"
import Loader from "@/components/Loader"

export default function SearchPage() {
  const { search } = useParams() as { search: string }

  const [firstLoad, setFirstLoad] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [nfts, setNFTs] = useState<TDisplayedNFT[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    (async () => {
      try {
        const { hasMore, nfts: n } = await getNFTsBySearch(page.toString(), search)

        setNFTs(n)
        setHasMore(hasMore)
      } catch(e) {
        console.error(e)
      } finally {
        setFirstLoad(false)
      }
    })()
  }, [])

  if(firstLoad) return <div className='pt80'>
    <Skeleton />
  </div>

  if(nfts.length < 1) return <p className='mt-[80px]'>No tokens with that specified name.</p>

  const handleLoadMore = async () => {
    try {
      setLoading(true)

      const { hasMore, nfts: n } = await getNFTsBySearch((page + 1).toString(), search)

      const temp = [...nfts, ...n]

      setNFTs(temp)
      setHasMore(hasMore)
      setPage(prev => prev + 1)
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return <div className='pt80 pb-[80px]'>
    <div className='grid gap-6 grid-repeat place-items-center max-[560px]:flex max-[560px]:flex-col max-[560px]:justify-center'>
      {
        nfts.map(token => <NFTCard
          key={token.name}
          nft={token}
        />)
      }
    </div>

    { loading ? <Loader /> : null }

    {
      hasMore ? <button
        aria-label='Load more...'
        className='
          relative left-1/2 -translate-x-1/2 mt-12 underline font-medium text-[18px] pointer
        '
        onClick={handleLoadMore}
      >
        Load more...
      </button> : null
    }
  </div>
}
