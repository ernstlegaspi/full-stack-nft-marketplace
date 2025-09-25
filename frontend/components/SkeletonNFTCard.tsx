export default function Skeleton() {
  const SkeletonCard = () => <div className='w-[250px] mt-10'>
    <div className='h-[250px] bg-gray-400 rounded'></div>

    <p className='rounded-full w-[60px] h-[20px] bg-gray-400 mt-5'></p>

    <p className='rounded-full w-full h-[20px] bg-gray-400 mt-5'></p>
    <p className='rounded-full w-full h-[20px] bg-gray-400 mt-2'></p>
    <p className='rounded-full w-full h-[20px] bg-gray-400 mt-2'></p>
  </div>
  
  return <div className="animate-pulse grid gap-6 grid-repeat place-items-center -mt-10">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />

    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
}
