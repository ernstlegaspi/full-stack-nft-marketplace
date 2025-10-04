import { create } from 'zustand'

type Props = {
  isShown: boolean
  setIsShown: (isShown: boolean) => void
  modalType: string
  setModalType: (modalType: string) => void
}

export const modalState = create<Props>(set => ({
  isShown: false,
  setIsShown: isShown => set(() => ({ isShown })),
  modalType: '',
  setModalType: modalType => set(() => ({ modalType }))
}))
