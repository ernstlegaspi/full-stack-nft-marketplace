export type TNFTInput = {
  attributes: { trait_type: string, value: string }[]
  backgroundColor: string
  collection: string
  contractAddress: string
  description: string
  metadataUrl: string
  name: string
}

type TNFT = {
  _id: string
  creator: string
  imageUrl: string
  ownerAddress: string
  ownerId: string
  tokenId: number
} & TNFTInput

export type TNFTResponse = {
  ok: boolean
  nft: TNFT
}
