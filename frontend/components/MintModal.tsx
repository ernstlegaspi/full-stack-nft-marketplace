'use client'

import { showMintModal } from '@/store/showMintModal'
import { IoAddSharp } from 'react-icons/io5'

/*
  auto generated metadata fields

  {
    "external_url": "https://yourwebsite.com/nfts/1",
    "creator": "Akie",
    "license": "CC BY-NC 4.0",
    "collection": "Room Series",
    "minted_at": "2025-09-09T12:00:00Z"
  }
*/

export default function MintModal() {
  const { isShown, setIsShown } = showMintModal()

  if(!isShown) return null

  const Label = ({ label }: { label: string }) => <p className='text-bb mb-1 font-medium'>{label}</p>

  return <div className='z-20 flex items-center justify-center fixed bg-black/50 inset-0'>
    <div className='w-[400px] border-2 border-bb rounded bg-white p-4'>
      <p className='font-medium text-[24px] mb-6'>Mint a new NFT</p>

      <div className='flex items-center justify-center h-[100px] rounded border-dashed border border-g cursor-pointer transition-all hover:bg-g'>
        <IoAddSharp className='text-[20px] mr-2 mt-[1px]' />
        <p>Upload NFT Image</p>
      </div>

      {/* <div className='mt-3'>
        <Label label='Background Color' />
        <input className='w-full border border-g rounded-sm outline-none p-2' name='backgroundColor' />
      </div> */}

      <div className='my-3'>
        <Label label='Name' />
        <input className='w-full border border-g rounded-sm outline-none p-2' name='name' />
      </div>

      <Label label='Collection' />
      <input className='w-full border border-g rounded-sm outline-none p-2' name='collection' placeholder='e.g. Room Series' />

      <div className='mt-3 mb-2'>
        <Label label='Description' />
        <textarea className='resize-none w-full border border-g rounded-sm outline-none p-2' name='description'></textarea>
      </div>

      <div className='flex items-center'>
        <Label label='Attributes' />
        <div className='rounded-full border border-bb ml-2 pointer'>
          <IoAddSharp />
        </div>
      </div>

      <div className='flex items-center'>
        <input className='w-full border border-g rounded-sm outline-none p-2' name='collection' placeholder='e.g. Theme' />
        <input className='ml-2 w-full border border-g rounded-sm outline-none p-2' name='collection' placeholder='e.g. Minimalist' />
      </div>

      <div className='flex items-center mt-4'>
        <button aria-label='Done' className='pointer bg-bb w-full text-w p-2 rounded-sm'>Mint</button>
        <button
          aria-label='Cancel'
          className='pointer bg-red-300 w-full ml-2 text-bb p-2 rounded-sm'
          onClick={() => {
            setIsShown(false)
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
}
