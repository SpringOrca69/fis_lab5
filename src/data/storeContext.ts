import { createContext, useContext, type Dispatch } from 'react'
import type { Action } from './storeCore'
import type { AppState } from './types'

export interface StoreValue {
  state: AppState
  dispatch: Dispatch<Action>
  resetDemo: () => void
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useStore(): StoreValue {
  const v = useContext(StoreContext)
  if (!v) throw new Error('useStore must be used inside StoreProvider')
  return v
}
