export type TNFTInput = {
  attributes: { trait_type: string, value: string }[]
  backgroundColor: string
  collection: string
  contractAddress: string
  description: string
  metadataUrl: string
  name: string
  nameSlug: string
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

export type TUserNFTs = {
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

export type TUserNFT = {
  contractAddress: string
  createdAt: Date
  ownerId: { address: string }
} & TUserNFTs

export type TSearchedNFTs = {
  imageUrl: string
  name: string
  tokenId: number
}
