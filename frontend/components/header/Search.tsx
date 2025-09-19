'use client'

import { ChangeEvent, useState } from "react"
import { IoIosSearch } from "react-icons/io"

import { searchNFT } from "@/actions/nft"
import { TSearchedNFTs } from "@/types"

export default function Search() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [nfts, setNFTs] = useState<TSearchedNFTs[]>([])
  const [loading, setLoading] = useState(true)

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const val = e.target.value

      setSearch(val)

      if(val.length < 3) return

      setLoading(true)

      const res = await searchNFT(page.toString(), val)

      console.log(res)

      setNFTs(res)
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const SearchResultCard = ({ imageUrl, name, tokenId }: { imageUrl: string, name: string, tokenId: number }) => <div className='p-2 flex pointer rounded transaition-all hover:bg-gray-200'>
    <img
      alt={name}
      src={imageUrl}
      className='w-[50px] h-[50px] rounded'
    />

    <div>
      <p className='text-[14px] ml-2'><span className='font-medium'>Token Name: </span> {name}</p>
      <p className='text-[14px] ml-2'><span className='font-medium'>Token ID: </span> {tokenId}</p>
    </div>
  </div>

  const Skeleton = () => <div className='animate-pulse p-2 flex rounded'>
    <div className='w-[50px] h-[50px] rounded bg-gray-300'></div>

    <div className='ml-2'>
      <p className='rounded-full h-[20px] w-[100px] bg-gray-300 mb-1'></p>
      <p className='rounded-full h-[20px] w-[35px] bg-gray-300'></p>
    </div>
  </div>

  return <div>
    <div className='w-[300px] flex items-center bg-white border-bb border rounded-[2px] ml-3 h-[30px]'>
      <div className='h-full w-[35px] pointer flex items-center justify-center'>
        <IoIosSearch size={20} />
      </div>
      <input
        className=' size-full outline-none placeholder:text-[14px] text-[14px]'
        placeholder='Search for token via token name' name='search'
        type='text'
        value={search}
        onChange={handleSearch}
      />
    </div>

    {
      search.length >= 3 ? <div className={`${nfts.length <= 3 ? 'h-auto' : 'h-[200px] overflow-y-scroll'} z-[30] bg-white bshadow w-[300px] absolute ml-[12px] mt-1 rounded`}>
        {
          loading ? <Skeleton />
          : !loading && nfts.length < 1 ? <p>No searchable nfts.</p>
          : nfts.map(nft => <SearchResultCard
            key={nft.name}
            imageUrl={nft.imageUrl}
            name={nft.name}
            tokenId={nft.tokenId}
          />)
        }
      </div> : null
    }
  </div>
}
