import Link from 'next/link'

import HeaderButtons from './HeaderButtons'
import Search from './Search'

export default function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  return <div className='fixed w-full z-[20] bg-w'>
    <div className='w-[95%] flex items-center justify-between mx-auto py-4'>
      <div className='flex items-center'>
        <Link href='/'>
          <h1 className='text-bb font-bold text-[30px] select-none'>NFT DApp</h1>
        </Link>

        <Search />
      </div>

      <div className='flex'>
        <HeaderButtons isAuthenticated={isAuthenticated} />
      </div>
    </div>
  </div>
}
