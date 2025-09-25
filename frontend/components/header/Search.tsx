'use client'

import Link from "next/link"
import { ChangeEvent, useState } from "react"

import { searchNFT } from "@/actions/nft"
import { TSearchedNFT } from "@/types"

export default function Search() {
  const [search, setSearch] = useState('')
  const [nfts, setNFTs] = useState<TSearchedNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const val = e.target.value

      setSearch(val)

      if(val.length < 3) return

      setLoading(true)

      const { nfts: n, hasMore } = await searchNFT(val)

      setNFTs(n)
      setHasMore(hasMore)
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const ClearSearchBar = () => {
    setNFTs([])
    setSearch('')
  }

  const SearchResultCard = ({ imageUrl, name, nameSlug, tokenId }: TSearchedNFT) => {
    return <Link
      onClick={ClearSearchBar}
      href={`/token/${nameSlug}`}
      className='p-2 flex pointer rounded transaition-all hover:bg-gray-200'
    >
      <img
        alt={name}
        src={imageUrl}
        className='w-[50px] h-[50px] rounded'
      />

      <div>
        <p className='text-[14px] ml-2'><span className='font-medium'>Token Name: </span> {name}</p>
        <p className='text-[14px] ml-2'><span className='font-medium'>Token ID: </span> {tokenId}</p>
      </div>
    </Link>
  }

  const Skeleton = () => <div className='animate-pulse p-2 flex rounded'>
    <div className='w-[50px] h-[50px] rounded bg-gray-300'></div>

    <div className='ml-2'>
      <p className='rounded-full h-[20px] w-[100px] bg-gray-300 mb-1'></p>
      <p className='rounded-full h-[20px] w-[35px] bg-gray-300'></p>
    </div>
  </div>

  return <div>
    <input
      className='
      bg-white border border-bb p-2 rounded-[2px] ml-2 w-[300px]
        size-full outline-none placeholder:text-[14px] text-[14px]
        max-[560px]:w-[95%] max-[560px]:mx-auto max-[560px]:block
      '
      placeholder='Search for token via token name' name='search'
      type='text'
      value={search}
      onChange={handleSearch}
    />

    {
      search.length >= 3 ? <>
        <div
          className={`
            ${nfts.length <= 3 ? 'h-auto' : 'h-[200px] overflow-y-scroll'} z-[30]
            bg-white bshadow w-[300px] absolute ml-[8px] mt-1 rounded
            max-[560px]:w-[95%] max-[560px]:left-1/2 max-[560px]:-translate-x-1/2 max-[560px]:ml-0
          `}>
          {
            loading ? <Skeleton />
            : !loading && nfts.length < 1 ? <p className='p-2'>No searchable nfts.</p>
            : <>
              {
                nfts.map(nft => <SearchResultCard
                  key={nft.name}
                  imageUrl={nft.imageUrl}
                  name={nft.name}
                  nameSlug={nft.nameSlug}
                  tokenId={nft.tokenId}
                />)
              }

              {
                hasMore ? <Link
                  href={`/search/${search}`}
                  className='block py-2 text-center pointer w-full transition-all hover:bg-gray-300'
                  onClick={ClearSearchBar}
                >
                  View more...
                </Link>
                : null
              }
            </>
          }
        </div>
      </> : null
    }
  </div>
}
