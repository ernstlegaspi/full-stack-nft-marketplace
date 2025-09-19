import Link from 'next/link'

import { TUserNFTs } from '@/types'

export default function NFTCard({ nft }: { nft: TUserNFTs }) {
  const { description, imageUrl, name } = nft

  return <div className='w-max'>
    <Link href={`/token/${name.toLowerCase().replaceAll(' ', '-')}`}>
      <div className='text-bb p-3 w-[250px] border border-g bg-white rounded'>
        <img
          alt={name}
          src={imageUrl}
          className="w-[250px] h-[250px] rounded"
        />

        <p className='font-medium mt-2'>{name}</p>

        <p>{description}</p>
      </div>
    </Link>
  </div>
}
