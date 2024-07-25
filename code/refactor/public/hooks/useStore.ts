import { useContext } from 'react'
import MobxProviderContext from '../stores/MobXProviderContext'

type STORES = Record<string, any>
type GET_STATE = (stores: STORES) => STORES

function useStore (getState?: GET_STATE): STORES {
  const stores = useContext(MobxProviderContext)

  if (typeof getState === 'function') {
    return getState(stores)
  }
  return stores
}

export default useStore
