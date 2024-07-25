import React, { Component } from 'react'
import * as mobx from 'mobx'
import { observer } from 'mobx-react'
import { Tabs } from '@uyun/components'
import './style/index.less'

const TabPane = Tabs.TabPane

@observer
class SwitchModel extends Component {
    switchTabs = processId => {
      this.props.ticketListStore.switchSceenData({
        processId: processId,
        current: 1
      })
    }

    render () {
      const { processList } = this.props.processListStore
      const screenData = mobx.toJS(this.props.ticketListStore.screenData)
      return (
        <div className="ticket-list-switch-model">
          <Tabs activeKey={screenData.processId} onChange={this.switchTabs}>
            {
              processList.map(process => {
                const tab = (
                  <div>
                    { process.processName }
                  ({ process.num })
                  </div>
                )
                return (
                  <TabPane tab={tab} key={process.processId || '0'} />
                )
              })
            }
          </Tabs>
        </div>
      )
    }
}

export default SwitchModel
