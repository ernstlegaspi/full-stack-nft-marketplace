import type { TNFTInput, TNFTResponse } from "@/types"

const url = `${process.env.NEXT_PUBLIC_API_URL!}nft/`

type TInput = {
  accessToken: string
  imageUrl: string
  ownerAddress: string
} & TNFTInput

type TUserNFTs = {
  attributes: { trait_type: string, value: string }[]
  backgroundColor: string
  collection: string
  creator: { address: string, name: string }
  description: string
  imageUrl: string
  metadataUrl: string
  name: string
  tokenId: number
}

export const mintNFT = async (data: TInput): Promise<TNFTResponse> => {
  const res = await fetch(
    `${url}mint`,
    {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )

  const body = await res.json() as TNFTResponse

  return body
}

export const getAllUserNFTs = async (accessToken: string, address: string, page: number) => {
  const res = await fetch(
    `${url}all/${address}/${page}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const body = await res.json() as TUserNFTs

  return body
}
