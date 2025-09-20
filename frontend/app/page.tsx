import Marketplace from "@/components/Marketplace"
import { getAllTokens } from "@/actions/nft"

export default async function App() {
  const tokens = await getAllTokens('1')

  return <div className='pt-[80px]'>
    <p className='font-medium text-[20px] mb-3'>Marketplace</p>

    <Marketplace tokens={tokens} />
  </div>
}
