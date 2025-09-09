import Link from 'next/link'

import HeaderButtons from './HeaderButtons'

export default function Header() {
  return <div className='fixed w-full'>
    <div className='w-[95%] flex items-center justify-between mx-auto pt-4'>
      <Link href='/'>
        <h1 className='text-bb font-bold text-[30px] select-none'>NFT DApp</h1>
      </Link>

      <div className='flex'>
        <HeaderButtons />
      </div>
    </div>
  </div>
}
