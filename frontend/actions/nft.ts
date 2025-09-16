import type { TNFTInput, TNFTResponse } from "@/types"

const url = process.env.NEXT_PUBLIC_API_URL!

type TInput = {
  accessToken: string
  imageUrl: string
  ownerAddress: string
  userId: string
} & TNFTInput

export const mintNFT = async (data: TInput): Promise<TNFTResponse> => {
  const res = await fetch(
    `${url}nft/mint`,
    {
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