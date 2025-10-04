'use client'

import { modalState } from '@/states/showModal'
import dynamic from 'next/dynamic'

const Mint = dynamic(() => import('./Mint'))
const Transfer = dynamic(() => import('./Transfer'))

export default function Modal() {
  const { modalType } = modalState()

  if(!modalType) return null

  if(modalType == 'mint') return <Mint />

  return <Transfer />
}
