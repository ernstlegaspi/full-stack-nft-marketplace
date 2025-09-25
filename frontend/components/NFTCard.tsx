import Link from 'next/link'

import { TDisplayedNFT } from '@/types'

export default function NFTCard({ nft }: { nft: TDisplayedNFT }) {
  const { backgroundColor, description, imageUrl, name, nameSlug } = nft

  const modifiedDescription = description.slice(0, 45)

  return <div className='w-max'>
    <Link href={`/token/${nameSlug}`}>
      <div className='text-bb h-[400px] p-3 w-[250px] border border-g bg-white rounded'>
        <div className='w-full h-[250px] relative overflow-hidden'>
          <div className='absolute z-[1] size-full' style={{ background: backgroundColor }}></div>

          <img
            alt={name}
            src={imageUrl}
            className='relative z-[2] size-full rounded'
          />
        </div>

        <p className='font-medium mt-2'>{name}</p>

        <p>{modifiedDescription}...</p>
      </div>
    </Link>
  </div>
}
