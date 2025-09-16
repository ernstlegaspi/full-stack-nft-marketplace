import { create } from 'zustand'

type Props = {
	isShown: boolean
	setIsShown: (isShown: boolean) => void
}

export const showMintModal = create<Props>(set => ({
	isShown: false,
	setIsShown: isShown => set(() => ({ isShown }))
}))
