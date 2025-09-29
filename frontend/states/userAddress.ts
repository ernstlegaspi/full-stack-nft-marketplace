import { create } from 'zustand'

type Props = {
	userAddress: string
	setUserAddress: (userAddress: string) => void
}

export const userUserAddress = create<Props>(set => ({
	userAddress: '',
	setUserAddress: userAddress => set(() => ({ userAddress }))
}))
