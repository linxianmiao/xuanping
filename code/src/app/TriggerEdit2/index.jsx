import React, { useEffect } from 'react'
import { Provider } from 'mobx-react'
import PageHeader from '~/components/pageHeader'
import Form from './Form'
import TriggerStore from './stores/TriggerStore'
import TriggerIndexStore from '~/trigger/store/indexStore'
import getURLParam from '~/utils/getUrl'

const triggerStore = new TriggerStore()
const triggerIndexStore = new TriggerIndexStore()

const TriggerEdit = (props) => {
  useEffect(() => {
    window.LOWCODE_APP_KEY = getURLParam('appkey')
    return () => {
      window.LOWCODE_APP_KEY = ''
    }
  }, [])
  // 组件用于低代码时，会从外部传入id
  return (
    <Provider triggerStore={triggerStore} triggerIndexStore={triggerIndexStore}>
      <div>
        {!window.LOWCODE_APP_KEY && <PageHeader />}
        <Form id={props.id} />
      </div>
    </Provider>
  )
}

export default TriggerEdit
