import type { TDisplayedNFT, TNFTInput, TNFTResponse, TSearchedNFT, TUserNFT } from "@/types"

const url = `${process.env.NEXT_PUBLIC_API_URL!}nft/`

type TInput = {
  imageUrl: string
  ownerAddress: string
} & TNFTInput

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

  return body
}

export const getAllUserNFTs = async (page: number) => {
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

  const body = await res.json() as { cached: boolean, nfts: TDisplayedNFT[] }

  return body.nfts
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
