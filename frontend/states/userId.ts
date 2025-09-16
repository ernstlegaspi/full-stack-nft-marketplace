import { create } from 'zustand'

type Props = {
	userId: string
	setUserId: (userId: string) => void
}

export const useUserId = create<Props>(set => ({
	userId: '',
	setUserId: userId => set(() => ({ userId }))
}))
