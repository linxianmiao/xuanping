import React, { useMemo } from 'react'
import { Observer, inject } from 'mobx-react'
import { Tabs } from '@uyun/components'
import useStores from '~/hooks/useStores'
import { demoLocation, demoHistory } from './config'

import AppData from './AppData'
import ModelList from '~/model-list'
import TriggerList from '~/trigger-list'
import styles from './styles/home.module.less'

const { TabPane } = Tabs

const Home = ({ globalStore }) => {
  const { lowcodeStore } = useStores()
  // 获取一些全局权限
  useMemo(() => {
    globalStore.getSwitch()
    globalStore.checkShowStatusButton()
    globalStore.getFilterNamesByRegular()
    globalStore.checkConfigAuthor()
    globalStore.checkListOperation()
  }, [])

  return (
    <Observer>
      {() => {
        const { homeKey } = lowcodeStore
        return (
          <Tabs
            className={styles.tabs}
            activeKey={homeKey}
            onChange={key => lowcodeStore.setProps({ homeKey: key, appDataKey: 'form_list' })}
          >
            <TabPane key="model_list" tab="流程模型">
              <ModelList location={demoLocation} />
            </TabPane>
            <TabPane key="trigger_list" tab="触发器">
              <TriggerList history={demoHistory} />
            </TabPane>
            <TabPane key="app_data" tab="应用数据">
              <AppData />
            </TabPane>
          </Tabs>
        )
      }}
    </Observer>
  )
}

export default inject('globalStore')(Home)
