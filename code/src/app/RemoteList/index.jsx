import React, { Component } from 'react'
import { Provider, inject, observer } from 'mobx-react'
import { Tabs } from '@uyun/components'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import Table from './Table'
import remoteListStore from './remoteListStore'

const { TabPane } = Tabs

@observer
export default class RemoteList extends Component {
  componentDidMount() {
    remoteListStore.query()
  }

  componentWillUnmount() {
    remoteListStore.reset()
  }

  render() {
    const { filters, onFilterFieldChange } = remoteListStore
    const { status } = filters

    return (
      <Provider remoteListStore={remoteListStore}>
        <div>
          <PageHeader customizeBreadcrumb={[{ name: '远程请求' }]} />
          <ContentLayout>
            <Tabs
              activeKey={`${status}`}
              onChange={(key) => onFilterFieldChange(key, 'status', true)}
            >
              <TabPane key="0" tab="未受理">
                <Table remoteListStore={remoteListStore} />
              </TabPane>
              <TabPane key="1" tab="已受理">
                <Table remoteListStore={remoteListStore} />
              </TabPane>
              <TabPane key="2" tab="已驳回">
                <Table remoteListStore={remoteListStore} />
              </TabPane>
            </Tabs>
          </ContentLayout>
        </div>
      </Provider>
    )
  }
}
