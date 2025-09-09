import dynamic from 'next/dynamic'

import Header from '@/components/header'

const MintModal = dynamic(() => import('@/components/MintModal'))

export default function App() {
  return <div className='bg-w min-h-screen'>
    <MintModal />
    <Header />

    <div className='w-[95%] mx-auto relative'>
    </div>
  </div>
}
