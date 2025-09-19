import Link from 'next/link'

import HeaderButtons from './HeaderButtons'

export default function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  return <div className='fixed w-full z-[20] bg-w'>
    <div className='w-[95%] flex items-center justify-between mx-auto py-4'>
      <Link href='/'>
        <h1 className='text-bb font-bold text-[30px] select-none'>NFT DApp</h1>
      </Link>

      <div className='flex'>
        <HeaderButtons isAuthenticated={isAuthenticated} />
      </div>
    </div>
  </div>
}
