import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { IoAddSharp, IoCloseSharp } from 'react-icons/io5'
import { FaCheck } from "react-icons/fa6"
import { HexColorPicker } from "react-colorful"
import { z } from 'zod'

import { TNFTInput } from '@/types'
import { mintNFT } from '@/actions/nft'
import { modalState } from '@/states/showModal'
import { contractAddress } from '@/constants'
import { uploadImageToPinata, uploadMetadataToPinata } from '@/actions/pinata'
import { createContractOnPageRefresh } from '@/utils/nft'
import { ethers } from 'ethers'
import { zMintNFT } from '@/zod'

type TState = {
  isAddingAttributes: boolean
  isImagePng: boolean
  imageURI: string
  key: string
  loading: boolean
  uploadedImage: File | null
  value: string
  price: string
} & Omit<TNFTInput, 'metadataUrl'>

export default function Mint() {
  const { isShown, setIsShown } = modalState()

  const [_contract, setContract] = useState<ethers.Contract>()
  const [_address, setAddress] = useState('')

  const imageRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    (async () => {
      try {
        const { address, contract } = await createContractOnPageRefresh()
        setAddress(address)
        setContract(contract)
      } catch(e) {
        alert('Error minting.')
        console.error(e)
      }
    })()
  }, [])

  const [state, setState] = useState<TState>({
    attributes: [],
    backgroundColor: '#ffffff',
    collection: '',
    contractAddress: contractAddress,
    description: '',
    name: '',
    nameSlug: '',
    price: '',

    isAddingAttributes: false,
    isImagePng: false,
    imageURI: '',
    key: '',
    loading: false,
    uploadedImage: null,
    value: '',
  })

  if(!isShown) return null

  const onClick = async () => {
    try {
      if(!_contract) {
        alert('Unable to mint token. Try again later.')
        return
      }

      if(!state.uploadedImage) {
        alert('No image found')
        return
      }

      const { attributes, collection, description, name } = state

      const result = zMintNFT.safeParse({
        attributes,
        collection,
        description,
        name
      })

      if(attributes.length < 1 && !collection && !description && !name) {
        alert('All fields are required!')
        return
      }

      if(!result.success) {
        const err = z.treeifyError(result.error).properties

        alert(
          err?.name?.errors
          || err?.collection?.errors
          || err?.description?.errors
          || err?.attributes?.errors
          || 'Unable to mint. Try again.'
        )

        return
      }

      handleState('loading', true)

      const imageUrl = await uploadImageToPinata(state.uploadedImage)
      const convertedImageUrl = `ipfs://${imageUrl}`

      const metadataUrl = await uploadMetadataToPinata({
        attributes: state.attributes,
        backgroundColor: state.backgroundColor,
        collection: state.collection,
        description: state.description,
        externalUrl: `${window.location.href}token/${state.name.replaceAll(' ', '-')}`,
        imageUrl: convertedImageUrl,
        name: state.name
      })

      const weiPrice = ethers.parseEther(state.price)
      const mintFee = ethers.parseEther('0.001')

      const eth = window?.ethereum

      const accounts = await eth?.request({ method: 'eth_accounts' })
      const acc = accounts[0]
      const userBalanceWei = await eth?.request({
        method: 'eth_getBalance',
        params: [acc, 'latest']
      })

      if(mintFee > userBalanceWei) {
        alert('You do not have enough balance for mint fee.')
        return
      }

      const { nft } = await mintNFT({
        imageUrl,
        attributes: state.attributes,
        backgroundColor: state.backgroundColor,
        collection: state.collection,
        contractAddress: state.contractAddress,
        description: state.description,
        name: state.name,
        nameSlug: state.name.toLowerCase().replaceAll(' ', '-'),
        metadataUrl,
        price: weiPrice.toString()
      })

      await _contract.mintNFT(nft.tokenId, `ipfs://${metadataUrl}`, BigInt(weiPrice), { value: mintFee })

      alert('Token Minted')
      window.location.reload()
    } catch(e) {
      console.error(e)
      alert('Unable to mint token. Try again later.')
    } finally {
      handleState('loading', false)
    }
  }

  const handleState = <K extends keyof TState>(key: K, value: TState[K]) => {
    setState(prev => ({ ...prev, [key]: value }))
  }

  const Label = ({ label }: { label: string }) => <p className='text-bb mb-1 font-medium'>{label}</p>

  const handleCheck = () => {
    if(state.loading) return

    state.attributes.push({ trait_type: state.key, value: state.value })

    handleState('key', '')
    handleState('value', '')
    handleState('isAddingAttributes', false)
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if(!e.target.files) return

      const file = e.target.files[0]

      if(!file) return

      const allowedTypes = ['image/webp', 'image/png', 'image/jpg', 'image/jpeg']

      if(!allowedTypes.includes(file.type.toLowerCase())) {
        alert('Images only.')
        return
      }

      handleState('uploadedImage', file)
      handleState('imageURI', URL.createObjectURL(file))
      handleState('isImagePng', file.type.split('/')[1] === 'png')
    } catch(e) {
      console.error(e)
    }
  }

  const uploadImageClick = () => {
    if(!imageRef.current || state.loading) return

    imageRef.current.click()
  }

  const handlePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value

    val = val.replace(/[^0-9.]/g, '')
    handleState('price', val)
  }

  return <div className='z-30 flex items-center justify-center fixed bg-black/50 inset-0'>
    <div className='w-[400px] border-2 border-bb rounded bg-white p-4 max-[410px]:w-[95%]'>
      <p className='font-medium text-[24px] mb-6'>Mint a new NFT</p>

      <div className='h-[200px] w-full relative'>
        <div className='absolute size-full z-[1]' style={{ background: state.backgroundColor }} >

        </div>

        <button
          aria-label='Upload NFT Image'
          disabled={state.loading}
          className={`
            ${state.loading ? 'cursor-default' : 'hover:bg-g pointer'}
            select-none flex size-full relative z-[2] items-center justify-center rounded
            border-dashed border border-g cursor-pointer transition-all
          `}
          onClick={uploadImageClick}
          style={{
            backgroundImage: `url(${state.imageURI})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {
            state.imageURI ? null
            : <>
              <IoAddSharp className='text-[20px] mr-2 mt-[1px]' />
              <p>Upload NFT Image</p>
            </>
          }
        </button>
      </div>

      {
        state.imageURI ? <p className='mt-2'><span className='font-medium'>Image name:</span> {state.uploadedImage!.name}</p>
        : null
      }

      <input
        accept='image/*'
        className='hidden'
        onChange={handleImageChange}
        ref={imageRef}
        type='file'
      />

      {
        state.isImagePng ? <div className='mt-3'>
          <Label label='Choose Background Color' />
          <HexColorPicker
            color={state.backgroundColor}
            onChange={color => {
              handleState('backgroundColor', color)
            }}
          />
          <p><span className='font-medium'>Color: </span>{state.backgroundColor}</p>
        </div> : null
      }

      <div className='my-3 flex items-center'>
        <div>
          <Label label='Name' />
          <input
            disabled={state.loading}
            className={`${state.loading ? 'input-disabled' : ''} input`}
            name='name'
            value={state.name}
            onChange={e => handleState('name', e.target.value)}
          />
        </div>

        <div className='ml-2'>
          <Label label='Price (ETH)' />
          <input
            type='text'
            onChange={handlePrice}
            disabled={state.loading}
            inputMode='decimal'
            pattern='[0-9.]*'
            className={`${state.loading ? 'input-disabled' : ''} input`}
            name='price'
            value={state.price}
          />
        </div>
      </div>

      <Label label='Collection' />
      <input
        disabled={state.loading}
        className={`${state.loading ? 'input-disabled' : ''} input`}
        name='collection'
        placeholder='e.g. Room Series'
        value={state.collection}
        onChange={e => handleState('collection', e.target.value)}
      />

      <div className='mt-3 mb-2'>
        <Label label='Description' />
        <textarea
          disabled={state.loading}
          className={`${state.loading ? 'input-disabled' : ''} resize-none input`}
          name='description'
          value={state.description}
          onChange={e => handleState('description', e.target.value)}
        >
        </textarea>
      </div>

      <div className='flex items-center'>
        <Label label='Attributes' />

        {
          state.isAddingAttributes ? null
          : <button
            aria-label='Add Attributes'
            disabled={state.loading}
            className={`${state.loading ? 'cursor-default' : 'pointer'} rounded-full border border-bb ml-2`}
            onClick={() => {
              if(state.loading) return

              handleState('isAddingAttributes', true)
            }
          }>
            <IoAddSharp />
          </button>
        }
      </div>

      {
          state.attributes.length < 1 ? null
        : state.attributes.map((attr, idx) => <div key={idx} className={`${state.isAddingAttributes ? 'mb-2' : ''} flex items-center`}>
          <p className='font-medium mr-1'>{attr.trait_type}: </p>
          <p>{attr.value}</p>
        </div>)
      }

      {
        state.isAddingAttributes ? <div className='flex items-center'>
          <input
            disabled={state.loading}
            className={`${state.loading ? 'input-disabled' : ''} input`}
            name='key'
            placeholder='e.g. Theme'
            value={state.key}
            onChange={e => {
              handleState('key', e.target.value)
            }}
          />
          <input
            disabled={state.loading}
            className={`${state.loading ? 'input-disabled' : ''} ml-2 input`}
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
            if(state.loading) return

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
          className={`${state.loading ? 'button-disabled' : 'bg-bb text-w pointer'} w-full p-2 rounded-sm`}
          disabled={state.loading}
          onClick={onClick}
        >
          Mint
        </button>
        <button
          aria-label='Cancel'
          className={`${state.loading ? 'button-disabled' : 'bg-red-300 text-bb pointer'} w-full ml-2 p-2 rounded-sm`}
          disabled={state.loading}
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
