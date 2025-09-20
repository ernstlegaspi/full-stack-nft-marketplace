'use client'

import { TDisplayedNFT } from "@/types"
import NFTCard from "./NFTCard"

export default function Marketplace({ tokens }: { tokens: TDisplayedNFT[] }) {
  return <div className='grid gap-8 grid-repeat place-items-center max-[560px]:flex max-[560px]:flex-col max-[560px]:justify-center'>
    {
      tokens.map(token => <NFTCard
        key={token.name}
        nft={token}
      />)
    }
  </div>
}
