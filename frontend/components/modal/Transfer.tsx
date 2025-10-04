import { ethers } from "ethers"
import { ChangeEvent, useEffect, useState } from "react"

import { modalState } from "@/states/showModal"
import { transferNFT } from "@/actions/nft"
import { createContractOnPageRefresh } from "@/utils/nft"

export default function Transfer() {
  const { setIsShown, setModalType } = modalState()

  const [loading, setLoading] = useState(false)
  const [tokenId, setTokenId] = useState(0)
  const [newOwnerAddress, setNewOwnerAddress] = useState('')
  const [contract, setContract] = useState<ethers.Contract | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const { contract } = await createContractOnPageRefresh()
        setContract(contract)
      } catch(e) {
        alert('Error minting.')
        console.error(e)
      }
    })()
  }, [])

  const handleTokenIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const modifiedVal = val.replaceAll(/[^0-9]/g, '')

    setTokenId(parseInt(modifiedVal ? modifiedVal : '0'))
  }

  const handleClick = async () => {
    try {
      if(!contract) {
        alert('Unable to transfer token. Try again later.')

        return
      }

      setLoading(true)

      await transferNFT({
        newOwnerAddress,
        tokenId
      })

      await contract.transferNFT(newOwnerAddress, tokenId)

      setTokenId(0)
      setNewOwnerAddress('')

      window.location.href = '/'
    } catch(e) {

    } finally {
      setLoading(false)
    }
  }

  return <div className='z-30 flex items-center justify-center fixed bg-black/50 inset-0'>
    <div className='p-4 bg-white bshadow rounded'>
    <label>Token ID</label>
      <input
        disabled={loading}
        className={`${loading ? 'input-disabled' : ''} mt-1  input`}
        name='tokenId'
        value={tokenId}
        onChange={handleTokenIdChange}
      />

      <label className='block mt-4'>New Owner Address</label>
      <input
        disabled={loading}
        className={`${loading ? 'input-disabled' : ''} mt-1  input`}
        name='newOwnerAddress'
        value={newOwnerAddress}
        onChange={e => setNewOwnerAddress(e.target.value)}
      />

      <div className='mt-4 w flex'>
        <button
          aria-label={ loading ? 'Loading...' : 'Submit' }
          className='py-2 rounded bg-bb text-white w-full mr-2 pointer transition-all hover:bg-hbb'
          type='button'
          onClick={handleClick}
        >
          { loading ? 'Loading...' : 'Submit' }
        </button>

        <button
          aria-label={ loading ? 'Loading...' : 'Cancel' }
          className='py-2 rounded bg-red-300 w-full pointer transition-all hover:bg-red-400'
          type='button'
          onClick={() => {
            setIsShown(false)
            setModalType('')
          }}
        >
          { loading ? 'Loading...' : 'Cancel' }
        </button>
      </div>
    </div>
  </div>
}
