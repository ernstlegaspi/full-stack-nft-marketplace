import { create } from 'zustand'

type Props = {
	token: string
	setToken: (token: string) => void
}

export const useTokenState = create<Props>(set => ({
	token: '',
	setToken: token => set(() => ({ token }))
}))
