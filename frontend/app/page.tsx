import dynamic from 'next/dynamic'

import Header from '@/components/header'
import Marketplace from '@/components/marketplace'

const MintModal = dynamic(() => import('@/components/MintModal'))

export default function App() {
  return <div className='bg-w min-h-screen'>
    <MintModal />
    <Header />

    <div className='w-[95%] mx-auto relative pt-[80px] z-10'>
      <Marketplace />
    </div>
  </div>
}
