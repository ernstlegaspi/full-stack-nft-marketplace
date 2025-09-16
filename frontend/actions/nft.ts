import type { TNFTInput } from "@/types"

const url = process.env.NEXT_PUBLIC_API_URL!

export const mintNFT = async (accessToken: string, data: TNFTInput, ownerAddress: string, userId: string) => {
  const res = await fetch(
    `${url}nft/mint`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        ownerAddress,
        userId
      })
    }
  )

  const body = await res.json()
  console.log(body)
}