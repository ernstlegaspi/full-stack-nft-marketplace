import { ethers, type Eip1193Provider } from 'ethers'
import { SiweMessage } from 'siwe'

import { contractABI, contractAddress } from '../constants'

export const isEip1193 = (p: unknown): p is Eip1193Provider => {
  return !!p && typeof (p as any).request === "function"
}

const URL = `${process.env.NEXT_PUBLIC_API_URL!}`

let _provider: ethers.BrowserProvider | null = null
let _connecting = false

let _contract: ethers.Contract | null = null
let _address = ''

export const createContract = async (): Promise<string> => {
  if(typeof window === "undefined" || !isEip1193(window.ethereum)) {
    throw new Error("No EIP-1193 provider found.")
  }

  if(_contract) return _address

  if(_connecting) {
    await new Promise((res) => {
      const i = setInterval(() => {
        if(_contract) {
          clearInterval(i)
          res(null)
        }
      }, 50)
    })

    return _address
  }

  try {
    _connecting = true

    _provider ??= new ethers.BrowserProvider(window.ethereum)

    let accounts: string[] = await window.ethereum.request({ method: "eth_accounts" })

    if(!accounts || accounts.length === 0) {
      accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    }

    if(!accounts || accounts.length === 0) {
      throw new Error("User did not connect an account.")
    }

    const signer = await _provider.getSigner()
    _contract = new ethers.Contract(contractAddress, contractABI, signer)
    const address = await signer.getAddress()
    _address = address
    const network = await _provider.getNetwork()
    const chainId = Number(network.chainId)

    const nonceRes = await fetch(`${URL}user/nonce`)

    const { nonce } = await nonceRes.json()

    const msg = new SiweMessage({
      address,
      domain: 'localhost',
      chainId,
      nonce,
      statement: 'Sign in to your account.',
      uri: window.location.origin,
      version: '1'
    })

    const prepMsg = msg.prepareMessage()

    const signature = await signer.signMessage(prepMsg)

    await fetch(
      `${URL}user/verify-signature`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prepMsg, signature })
      }
    )

    const balanceWei = await _provider.getBalance(address)

    await fetch(
      `${URL}user/`,
      {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, accountBalance: balanceWei.toString() })
      }
    )

    return address
  } finally {
    _connecting = false
  }
}

export const checkEthConnection = async () => {
  const eth = window.ethereum

  if(!eth) throw new Error('Please install Metamask.')

  const accounts = await eth.request({ method: 'eth_accounts' })
  console.log(accounts)
}

export const createContractOnPageRefresh = async (): Promise<{ address: string, contract: ethers.Contract }> => {
  if(typeof window === 'undefined' || !isEip1193(window.ethereum)) {
    throw new Error("No EIP-1193 provider found.")
  }

  const eth = window.ethereum
  const accounts: [] = await eth.request({ method: 'eth_accounts' })

  if(!accounts || accounts.length < 1) throw new Error('Please sign in to metamask.')

  const provider = new ethers.BrowserProvider(eth)
  const signer = await provider.getSigner()
  const address = await signer.getAddress()
  const contract = new ethers.Contract(contractAddress, contractABI, signer)

  return { address, contract }
}
