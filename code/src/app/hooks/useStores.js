
import { createContext, useContext } from 'react'

export const MobxProviderContext = createContext({})

function useStores(getState) {
  const stores = useContext(MobxProviderContext)

  if (typeof getState === 'function') {
    return getState(stores)
  }
  return stores
}

export default useStores
