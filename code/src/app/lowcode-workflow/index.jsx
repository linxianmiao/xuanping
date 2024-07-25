import React, { useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { Provider, Observer } from 'mobx-react'
import { Empty } from '@uyun/components'
import LowcodeStore from './stores/LowcodeStore'
import stores from '~/stores'
import { MobxProviderContext } from '~/hooks/useStores'
import Home from './Home'
import ModelCreate from '~/create-model'
import ModelEdit from '~/model'
import TriggerEdit from '~/TriggerEdit2'
import TriggerLogList from '~/trigger-list/logList'
import FieldEdit from '~/create-field'
import { demoLocation, demoMatch } from './config'

export const lowcodeStore = new LowcodeStore()

function Workflow(props) {
  if (!props.appKey) {
    return <Empty description="未找到appKey" />
  }

  // 需要接收外部传来的appkey
  window.LOWCODE_APP_KEY = props.appKey

  useEffect(() => {
    // 获取自定义字段信息
    // stores.loadFieldWidgetStore.getCustomFieldInfos()

    return () => {
      lowcodeStore.clear()
      window.LOWCODE_APP_KEY = null
    }
  }, [])

  return (
    <Provider {...stores}>
      <MobxProviderContext.Provider value={{ lowcodeStore }}>
        <HashRouter>
          <div style={{ height: '100%' }}>
            <Observer>
              {() => {
                const { pageKey, modelId, triggerId, fieldCode, canModelOperate } = lowcodeStore
                switch (pageKey) {
                  case 'home':
                    return <Home />
                  case 'model_edit':
                    return <ModelEdit id={modelId} match={demoMatch} />
                  case 'model_create':
                    return <ModelCreate match={demoMatch} />
                  case 'trigger_edit':
                    return <TriggerEdit id={triggerId} />
                  case 'trigger_create':
                    return <TriggerEdit />
                  case 'trigger_log_list':
                    return <TriggerLogList id={triggerId} location={demoLocation} match={demoMatch} />
                  case 'field_create':
                    return <FieldEdit modelId={modelId} location={demoLocation} match={demoMatch} />
                  case 'field_edit':
                    return (
                      <FieldEdit
                        fieldCode={fieldCode}
                        modelId={modelId}
                        canModelOperate={canModelOperate}
                        location={demoLocation}
                        match={demoMatch}
                      />
                    )
                  default:
                    return null
                }
              }}
            </Observer>
          </div>
        </HashRouter>
      </MobxProviderContext.Provider>
    </Provider>
  )
}

export default Workflow
