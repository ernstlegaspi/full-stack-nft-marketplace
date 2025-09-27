import { redirect } from "next/navigation"

import Tokens from "./TokensPage"
import { useCookies } from "@/utils"

export default async function TokensPage() {
  const { isAuthenticated } = await useCookies()

  if(!isAuthenticated) redirect('/')

  return <div className='py-[80px]'>
    <Tokens />
  </div>
}
