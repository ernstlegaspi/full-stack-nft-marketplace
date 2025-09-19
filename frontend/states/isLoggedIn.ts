import { create } from 'zustand'

type Props = {
	isLoggedIn: boolean
	setIsLoggedIn: (isLoggedIn: boolean) => void
}

export const useIsLoggedIn = create<Props>(set => ({
	isLoggedIn: false,
	setIsLoggedIn: isLoggedIn => set(() => ({ isLoggedIn }))
}))
