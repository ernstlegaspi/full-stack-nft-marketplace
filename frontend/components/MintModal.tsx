'use client'

import { useState } from 'react'
import { IoAddSharp, IoCloseSharp } from 'react-icons/io5'
import { FaCheck } from "react-icons/fa6"

import { TNFTInput } from '@/types'
import { mintNFT } from '@/actions/nft'
import { showMintModal } from '@/states/showMintModal'
import { useTokenState } from '@/states/token'
import { useUserId } from '@/states/userId'
import { contractAddress } from '@/constants'
import { _ownerAddress } from '@/utils/nft'

/*
  NFT fields

  image_url
  name
  description
  collection
  attributes

  auto generated metadata fields

  {
    "external_url": "https://yourwebsite.com/nfts/1",
    "creator": "Akie",
    "license": "CC BY-NC 4.0",
    "collection": "Room Series",
    "minted_at": "2025-09-09T12:00:00Z"
  }
*/

// attributes: [{ key: string, value: string | boolean | number }]
// backgroundColor: string
// collection: string
// contractAddress: string
// description: string
// imageUrl: string
// name: string
// ownerAddress: string
// tokenId: number
// userId: string

type TState = {
  isAddingAttributes: boolean
  key: string
  loading: boolean
  value: string
} & TNFTInput

export default function MintModal() {
  const { isShown, setIsShown } = showMintModal()
  const { userId } = useUserId()
  const { token } = useTokenState()

  const [state, setState] = useState<TState>({
    attributes: [],
    backgroundColor: '#ffffff',
    collection: '',
    contractAddress: contractAddress,
    description: '',
    imageUrl: 'https://mywebsite.com/image_name/1',
    name: '',

    isAddingAttributes: false,
    key: '',
    loading: false,
    value: ''
  })

  if(!isShown) return null

  const onClick = async () => {
    try {
      await mintNFT(
        token,
        {
          attributes: state.attributes,
          backgroundColor: state.backgroundColor,
          collection: state.collection,
          contractAddress: state.contractAddress,
          description: state.description,
          imageUrl: state.imageUrl,
          name: state.name
        },
        _ownerAddress,
        userId
      )
    } catch(e) {
      console.error(e)
      alert('ERRORRR')
    }
  }

  const handleState = <K extends keyof TState>(key: K, value: TState[K]) => {
    setState(prev => ({ ...prev, [key]: value }))
  }

  const Label = ({ label }: { label: string }) => <p className='text-bb mb-1 font-medium'>{label}</p>

  const handleCheck = () => {
    state.attributes.push({ key: state.key, value: state.value })

    handleState('key', '')
    handleState('value', '')
    handleState('isAddingAttributes', false)
  }

  return <div className='z-30 flex items-center justify-center fixed bg-black/50 inset-0'>
    <div className='w-[400px] border-2 border-bb rounded bg-white p-4'>
      <p className='font-medium text-[24px] mb-6'>Mint a new NFT</p>

      <div className='flex items-center justify-center h-[100px] rounded border-dashed border border-g cursor-pointer transition-all hover:bg-g'>
        <IoAddSharp className='text-[20px] mr-2 mt-[1px]' />
        <p>Upload NFT Image</p>
      </div>

      {/* will exist if image is .png */}
      {/* <div className='mt-3'>
        <Label label='Background Color' />
        <input className='input' name='backgroundColor' />
      </div> */}

      <div className='my-3'>
        <Label label='Name' />
        <input
          className='input'
          name='name'
          value={state.name}
          onChange={e => handleState('name', e.target.value)}
        />
      </div>

      <Label label='Collection' />
      <input
        className='input'
        name='collection'
        placeholder='e.g. Room Series'
        value={state.collection}
        onChange={e => handleState('collection', e.target.value)}
      />

      <div className='mt-3 mb-2'>
        <Label label='Description' />
        <textarea
          className='resize-none input' name='description' value={state.description} onChange={e => handleState('description', e.target.value)}></textarea>
      </div>

      <div className='flex items-center'>
        <Label label='Attributes' />

        {
          state.isAddingAttributes ? null
          : <div className='rounded-full border border-bb ml-2 pointer' onClick={() => handleState('isAddingAttributes', true)}>
            <IoAddSharp />
          </div>
        }
      </div>

      {
          state.attributes.length < 1 ? null
        : state.attributes.map((attr, idx) => <div key={idx} className={`${state.isAddingAttributes ? 'mb-2' : ''} flex items-center`}>
          <p className='font-medium mr-1'>{attr.key}: </p>
          <p>{attr.value}</p>
        </div>)
      }

      {
        state.isAddingAttributes ? <div className='flex items-center'>
          <input
            className='input'
            name='key'
            placeholder='e.g. Theme'
            value={state.key}
            onChange={e => {
              handleState('key', e.target.value)
            }}
          />
          <input
            className='ml-2
            input'
            name='value'
            placeholder='e.g. Minimalist'
            value={state.value}
            onChange={e => {
              handleState('value', e.target.value)
            }}
          />

          <div className='text-green-400 ml-1 pointer h-[40px] flex items-center px-1' onClick={handleCheck}>
            <FaCheck size={14} />
          </div>

          <div className='text-red-400 ml-1 pointer h-[40px] flex items-center px-1' onClick={() => {
            handleState('isAddingAttributes', false)
          }}>
            <IoCloseSharp />
          </div>
        </div>
        : null
      }

      <div className='flex items-center mt-4'>
        <button
          aria-label='Done'
          className='pointer bg-bb w-full text-w p-2 rounded-sm'
          onClick={onClick}
        >
          Mint
        </button>
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
