import React, { Component } from 'react'
import { Tabs } from '@uyun/components'
import Definition from './definition'
import Policy from './policy'
import SlaStatistics from './SlaStatistics'
import OlaStatistics from './OlaStatistics'
import OlaProcessorStatistics from './OlaProcessorStatistics'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ErrorBoundary from '~/components/ErrorBoundary'
import { inject, observer } from 'mobx-react'

const TabPane = Tabs.TabPane

@inject('globalStore')
class SlaIndex extends Component {
  state = {
    activeKey: 'policy'
  }

  componentDidMount() {
    const { configAuthor } = this.props.globalStore
    const { slaStrategy, slaDefine, slaRecordView, olaRecordView } = configAuthor
    if (slaStrategy) {
      this.setState({ activeKey: 'policy' })
    } else if (slaDefine) {
      window.location.replace('#/conf/sla/definition')
      this.setState({ activeKey: 'definition' })
    } else if (slaRecordView) {
      window.location.replace('#/conf/sla/slaStatistics')
      this.setState({ activeKey: 'slaStatistics' })
    } else {
      window.location.replace('#/conf/sla/olaRecordView')
      this.setState({ activeKey: 'olaRecordView' })
    }
  }

  handleChangeActive = (key) => {
    this.setState({ activeKey: key })
    this.props.history.push(`/conf/sla/${key}`)
  }

  handleSlaRecordsView = (strategyId) => {
    window.SLA_STATISTICS_FILTERS = { strategyId }
    this.handleChangeActive('slaStatistics')
  }

  render() {
    const { configAuthor } = this.props.globalStore // 全局权限
    const { activeKey } = this.state
    return (
      <React.Fragment>
        <PageHeader />
        <ContentLayout>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <Tabs activeKey={activeKey} onChange={this.handleChangeActive}>
              {configAuthor.slaStrategy && (
                <TabPane tab={i18n('sla.strategy', 'SLA策略')} key="policy">
                  <Policy onRecordsView={this.handleSlaRecordsView} />
                </TabPane>
              )}
              {configAuthor.slaDefine && (
                <TabPane tab={i18n('sla.definition', 'SLA定义')} key="definition">
                  <Definition />
                </TabPane>
              )}
              {configAuthor.slaRecordView && (
                <TabPane tab={'SLA统计'} key="slaStatistics">
                  {activeKey === 'slaStatistics' && <SlaStatistics configAuthor={configAuthor} />}
                </TabPane>
              )}
              {configAuthor.olaRecordView && (
                <TabPane tab={'OLA统计'} key="olaStatistics">
                  <OlaStatistics configAuthor={configAuthor} />
                </TabPane>
              )}
              {configAuthor.olaRecordView && (
                <TabPane tab={'OLA处理人统计'} key="olaProcessorStatistics">
                  <OlaProcessorStatistics configAuthor={configAuthor} />
                </TabPane>
              )}
            </Tabs>
          </ErrorBoundary>
        </ContentLayout>
      </React.Fragment>
    )
  }
}

export default SlaIndex
