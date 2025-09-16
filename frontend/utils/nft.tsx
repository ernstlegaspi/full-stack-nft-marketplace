import { ethers, type Eip1193Provider } from 'ethers'
import { SiweMessage } from 'siwe'

import { contractABI, contractAddress } from '../constants'

type TAuth = {
  id: string
  token: string
}

function isEip1193(p: unknown): p is Eip1193Provider {
  return !!p && typeof (p as any).request === "function"
}

const URL = `${process.env.NEXT_PUBLIC_API_URL!}`

let _provider: ethers.BrowserProvider | null = null
let _connecting = false
let _body: TAuth

export let _ownerAddress: string
export let _contract: ethers.Contract | null = null

export const createContract = async () => {
  if(typeof window === "undefined" || !isEip1193(window.ethereum)) {
    throw new Error("No EIP-1193 provider found.")
  }

  if(_contract) return _body

  if(_connecting) {
    await new Promise((res) => {
      const i = setInterval(() => {
        if(_contract) {
          clearInterval(i)
          res(null)
        }
      }, 50)
    })

    return _body
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
    _ownerAddress = address
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

    const res = await fetch(
      `${URL}user/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, accountBalance: balanceWei.toString() })
      }
    )

    const body = await res.json() as TAuth
    _body = body

    return body
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
