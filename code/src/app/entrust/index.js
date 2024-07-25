import React, { Component } from 'react'
import { Tabs } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import { qs } from '@uyun/utils'

import EntrustMessage from './components/EntrustMessage'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import MyEntrust from './MyEntrust'
import EntrustMe from './EntrustMe'
import EntrustCheck from './EntrustCheck'
import EntrustForce from './EntrustForce'

import './index.less'

const TabPane = Tabs.TabPane

@inject('globalStore')
@observer
class Entrust extends Component {
  state = {
    currentTab: 'Entrust-mine',
    entrustmessage: null
  }

  componentDidMount() {
    const activeKey = qs.parse(this.props.location.search.slice(1))?.activeKey
    this.setState({ currentTab: activeKey || 'Entrust-mine' })
  }

  onChange = (key) => {
    this.setState({ currentTab: key })
  }

  onChangeEntrustmessage = (entrustmessage) => {
    this.setState({ entrustmessage })
  }

  render() {
    const { currentTab, entrustmessage } = this.state
    return (
      <div className="entrust-wrapper">
        <PageHeader customizeBreadcrumb={[{ name: '委托管理' }]} />
        <ContentLayout>
          <Tabs activeKey={currentTab} onChange={this.onChange}>
            <TabPane tab="我的委托" key="Entrust-mine">
              <MyEntrust
                currentTab={currentTab}
                onChangeEntrustmessage={this.onChangeEntrustmessage}
              />
            </TabPane>
            <TabPane tab="委托审核" key="Entrust-check">
              <EntrustCheck
                currentTab={currentTab}
                onChangeEntrustmessage={this.onChangeEntrustmessage}
              />
            </TabPane>
            <TabPane tab="委托我的" key="EntrustMe">
              <EntrustMe
                currentTab={currentTab}
                onChangeEntrustmessage={this.onChangeEntrustmessage}
              />
            </TabPane>
            {this.props.globalStore.configAuthor.forceEntrust && (
              <TabPane tab="强制委托" key="Entrust-force">
                <EntrustForce
                  currentTab={currentTab}
                  onChangeEntrustmessage={this.onChangeEntrustmessage}
                />
              </TabPane>
            )}
          </Tabs>
        </ContentLayout>
        <EntrustMessage
          details={entrustmessage}
          currentTab={currentTab}
          onChangeEntrustmessage={this.onChangeEntrustmessage}
        />
      </div>
    )
  }
}

export default Entrust
