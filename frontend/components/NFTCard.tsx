import Link from 'next/link'

import { TDisplayedNFT } from '@/types'

export default function NFTCard({ nft }: { nft: TDisplayedNFT }) {
  const { description, imageUrl, name, nameSlug } = nft

  return <div className='w-max'>
    <Link href={`/token/${nameSlug}`}>
      <div className='text-bb h-[400px] p-3 w-[250px] border border-g bg-white rounded'>
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
