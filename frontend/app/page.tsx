import dynamic from 'next/dynamic'
import { cookies } from 'next/headers'

import Header from '@/components/header'
import Marketplace from '@/components/marketplace'

const MintModal = dynamic(() => import('@/components/MintModal'))

export default async function App() {
  const _cookies = await cookies()
  const token = _cookies.get('token')
  const isAuthenticated = token ? true : false
  console.log(token)

  return <div className='bg-w min-h-screen'>
    {
      token ? <MintModal token={token} />
      : null
    }

    <Header isAuthenticated={isAuthenticated} />

    <div className='w-[95%] mx-auto relative pt-[80px] z-10'>
      <Marketplace />
    </div>
  </div>
}
