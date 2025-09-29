const url = `${process.env.NEXT_PUBLIC_API_URL!}user/`

export const getUserAddress = async (): Promise<string> => {
  const res = await fetch(
    `${url}user-address`,
    {
      method: 'GET',
      credentials: 'include'
    }
  )

  const { address } = await res.json() as { address: string }

  return address
}
