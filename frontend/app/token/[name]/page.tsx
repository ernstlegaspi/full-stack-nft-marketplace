import Link from "next/link"
import { redirect } from "next/navigation"
import { format } from 'date-fns'

import { useCookies } from "@/utils"
import { getTokenPerName } from "@/actions/nft"

export default async function TokenPage({ params }: { params: Promise<{ name: string }> }) {
  const { isAuthenticated } = await useCookies()
  if(!isAuthenticated) redirect('/')

  const n = (await params).name
  const res = await getTokenPerName(n)

  const Details = () => <>
    <p className='mb-1'><span className='font-medium'>Name: </span>{res.name}</p>
    <p className='mb-1'><span className='font-medium'>Token ID: </span>{res.tokenId}</p>
    <p className='mb-1'><span className='font-medium'>Collection: </span>{res.collection}</p>
    <p className='font-medium'>Attributes:</p>

    {
      res.attributes.map((attr, idx) => <div key={idx} className='flex v-center max-[380px]:block'>
        <p className='mr-1'>{idx + 1}.</p>
        <p><span className='font-medium'>Trait Type: </span> {attr.trait_type}</p>
        <p className='ml-2 max-[380px]:ml-0'><span className='font-medium'>Value: </span> {attr.value}</p>
      </div>)
    }
  </>

  return <div className='flex items-center justify-center min-h-screen'>
    <div className='p-4 bg-white bshadow rounded'>
      <div className='flex'>
        <img
          alt={res.name}
          src={res.imageUrl}
          className='h-[250px] w-[250px] rounded max-[680px]:mx-auto'
        />

        <div className='ml-3 max-[680px]:hidden'>
          <Details />
        </div>
      </div>

      <div className='hidden mt-2 max-[680px]:block'>
        <Details />
      </div>

      <Link
        href={`https://ipfs.io/ipfs/${res.metadataUrl}`}
        className='block font-bold underline pointer mt-1 text-[18px] w-max'
        target='_blank'
        rel='noreferrer'
      >
        Metadata
      </Link>

      <p className='mt-1'>
        <span className='mr-1 font-medium'>Contract Address: </span>
        <Link className='break-all underline text-blue-600 transition-all hover:text-blue-800' href='/'>{res.contractAddress}</Link>
      </p>

      <p className='mt-1'>
        <span className='mr-1 font-medium'>Minted by: </span>
        <Link className='break-all underline text-blue-600 transition-all hover:text-blue-800' href='/'>{res.creator.address}</Link>
      </p>

      <div className='flex items-center mt-1'>
        <span className='mr-1 font-medium'>Minted at: </span>
        <p>{format(res.createdAt, 'MMMM dd, yyyy')}</p>
      </div>

      <p className='mt-1'>
        <span className='mr-1 font-medium'>Owned by: </span>
        <Link className='break-all underline text-blue-600 transition-all hover:text-blue-800' href='/'>{res.ownerId.address}</Link>
      </p>

      <p className='font-medium mt-3'>Description:</p>
      <p>{res.description}</p>
    </div>
  </div>
}
