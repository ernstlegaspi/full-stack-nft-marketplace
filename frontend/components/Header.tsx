import Link from 'next/link'

export default function Header() {
  return <div className='fixed w-full'>
    <div className='w-[95%] flex items-center justify-between mx-auto pt-4'>
      <Link href='/'>
        <h1 className='text-b font-bold text-[30px] select-none'>NFT DApp</h1>
      </Link>

      <div className="flex">
        <div className='transition-all bg-w button text-b hover:bg-b hover:text-w'>
          Connect Wallet
        </div>
        <div className="button text-w bg-b px-4 ml-2">Mint NFT</div>
      </div>
    </div>
  </div>
}
