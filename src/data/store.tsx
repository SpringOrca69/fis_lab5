import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { createSeed } from './seed'
import { loadState, reducer, saveState } from './storeCore'
import { StoreContext } from './storeContext'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const resetDemo = useCallback(() => dispatch({ type: 'reset', state: createSeed(new Date()) }), [])
  const value = useMemo(() => ({ state, dispatch, resetDemo }), [state, resetDemo])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
