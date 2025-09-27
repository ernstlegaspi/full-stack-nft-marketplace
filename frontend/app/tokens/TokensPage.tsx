'use client'

import { useEffect, useState } from "react"

import NFTCard from "@/components/NFTCard"
import Skeleton from "@/components/SkeletonNFTCard"
import { TDisplayedNFT } from "@/types"
import { getAllUserNFTs } from "@/actions/nft"
import Loader from "@/components/Loader"

export default function Tokens() {
  const [nfts, setNFTs] = useState<TDisplayedNFT[]>([])
  const [page, setPage] = useState(1)
  const [pageLoad, setPageLoad] = useState(true)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setPageLoad(true)

        const { hasMore, nfts: n } = await getAllUserNFTs(page.toString())

        setNFTs(n)
        setHasMore(hasMore)
      } catch(e) {
        console.error(e)
      } finally {
        setPageLoad(false)
      }
    })()
  }, [])

  if(pageLoad) return <Skeleton />
  if(nfts.length < 1) return <p>No current NFTs.</p>

  const handleLoadMore = async () => {
    try {
      setLoading(true)

      const res = await getAllUserNFTs((page + 1).toString())

      const temp = [...nfts, ...res.nfts]

      setNFTs(temp)
      setPage(prev => prev + 1)
      setHasMore(res.hasMore)
    } catch(e) {
      console.error(e)
      alert('Unable to load more. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return <>
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
          relative left-1/2 -translate-x-1/2 mt-7 underline font-medium text-[18px] pointer
        '
        onClick={handleLoadMore}
      >
        Load more...
      </button> : null
    }
  </>
}
