import Image from 'next/image'

import i from '@/public/room1.jpg'

export default function NFTCard() {
  return <div className='text-bb p-3 w-[250px] border border-g bg-white rounded'>
    <Image
      alt="Test Image"
      src={i}
      className='w h-[250px] rounded'
    />

    <p className='font-medium mt-2'>NFT Name</p>

    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Velit provident vero quis expedita tempore explicabo soluta labore error quisquam, eaque, repellendus alias natus vel reprehenderit dolorum! Ullam est et eum.</p>
  </div>
}
