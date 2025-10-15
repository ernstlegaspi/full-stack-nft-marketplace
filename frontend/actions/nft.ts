import type { TDisplayedNFT, TNFTInput, TNFTResponse, TSearchedNFT, TTransfer, TUserNFT } from "@/types"

const url = `${process.env.NEXT_PUBLIC_API_URL!}nft/`

type TInput = {
  imageUrl: string
  price: string
} & TNFTInput

type TUserTokens = {
  tokenId: number
} & TDisplayedNFT

export const mintNFT = async (data: TInput): Promise<TNFTResponse> => {
  const res = await fetch(
    `${url}mint`,
    {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )

  const body = await res.json() as TNFTResponse
  console.log(body)

  return body
}

export const getAllUserNFTs = async (page: string) => {
  const res = await fetch(
    `${url}all/user/${page}`,
    {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  const body = await res.json() as { cached: boolean, hasMore: boolean, nfts: TUserTokens[] }

  return body
}

export const getTokenPerName = async (name: string) => {
  const res = await fetch(
    `${url}token/${name}`,
    {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  const body = await res.json() as { cached: boolean, nft: TUserNFT }

  return body.nft
}

export const getAllTokens = async (page: string) => {
  const res = await fetch(
    `${url}all/${page}`,
    {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  const body = await res.json() as { cached: boolean, hasMore: boolean, nfts: TDisplayedNFT[] }

  return body
}

export const searchNFT = async (search: string) => {
  const res = await fetch(
    `${url}search/${search}`,
    {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  const body = await res.json() as { cached: boolean, hasMore: boolean, nfts: TSearchedNFT[] }

  return body
}

export const getNFTsBySearch = async (page: string, search: string) => {
  const res = await fetch(
    `${url}search-page/${page}/${search}`,
    {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  const body = await res.json() as { cached: boolean, hasMore: boolean, nfts: TDisplayedNFT[] }
  console.log(body)

  return body
}

export const burnNFT = async (_id: string) => {
  const res = await fetch(
    `${url}`,
    {
      credentials: 'include',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ _id })
    }
  )

  const body = await res.json() as { ok: boolean, data: { message: string, token: string } }
  console.log(body)

  return body
}

export const transferNFT = async (data: TTransfer) => {
  const res = await fetch(
    `${url}transfer`,
    {
      credentials: 'include',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )

  const body = await res.json() as { ok: boolean, message: string }
  console.log(body)

  return body
}

export const buyNFT = async (tokenId: number) => {
  const res = await fetch(
    `${url}buy`,
    {
      credentials: 'include',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tokenId })
    }
  )

  const body = await res.json() as { ok: boolean, message: string }
  console.log(body)

  return body
}
