'use server'

import { TNFTInput } from "@/types"

type TIpfs = {
  IpfsHash: string
  PinSize: number
  Timestamp: Date,
  ID: string
  Name: string
  NumberOfFiles: number
  MimeType: string
  GroupId: number | null
  Keyvalues: string | null
}

type TMetadata = {
  externalUrl: string,
  imageUrl: string
} & Omit<TNFTInput, 'contractAddress' | 'metadataUrl' | 'nameSlug'>

// full metadata of nft
// {
//   "name": "Sword of Dawn #1",
//   "description": "A legendary sword forged by the ancients.",
//   "image": "ipfs://QmXYZ456/sword.png",
//   "backgroundColor"
//   "collection"
//   "external_url": "https://mygame.com/sword/1",
//   "animation_url": "ipfs://QmABC123/sword.glb",
//   "youtube_url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
//   "attributes": [
//     { "trait_type": "Power", "value": 95 },
//   ],
//   "properties": {
//     "files": [
//       { "uri": "ipfs://QmXYZ456/sword.png", "type": "image/png" },
//       { "uri": "ipfs://QmABC123/sword.glb", "type": "model/gltf-binary" }
//     ],
//     "category": "game-item"
//   }
// }

export const uploadImageToPinata = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT!}`
      },
      body: formData
    }
  )

  const { IpfsHash } = await res.json() as TIpfs

  return IpfsHash
}

export const uploadMetadataToPinata = async (data: TMetadata): Promise<string> => {
  const metadata = {
    name: data.name,
    description: data.description,
    collection: data.collection,
    image:data.imageUrl,
    backgroundColor: data.backgroundColor,
    external_url: data.externalUrl,
    attributes: data.attributes
  }

  const jsonStr = JSON.stringify(metadata, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const file = new File([blob], `${data.name.toLowerCase().replaceAll(' ', '_')}.json`, { type: 'application/json' })
  const formData = new FormData()

  formData.append('file', file)

  const res = await fetch(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT!}`
      },
      body: formData
    }
  )

  const { IpfsHash } = await res.json() as TIpfs

  return IpfsHash
}
