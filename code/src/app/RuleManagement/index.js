import React, { Component } from 'react'
import { Tabs } from '@uyun/components'
import PageHeader from '~/components/pageHeader'
import ErrorBoundary from '~/components/ErrorBoundary'
import TriggerList from '../trigger-list'
import HandleList from './HandlerList'
import styles from './index.module.less'
const TabPane = Tabs.TabPane
export default class RuleManagement extends Component {
  render() {
    return (
      <div className={styles.ruleManagement}>
        <PageHeader />
        <Tabs>
          <TabPane tab={i18n('handler_rule', '处理人规则')} key="handler">
            <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
              <HandleList />
            </ErrorBoundary>
          </TabPane>
          <TabPane tab={i18n('action_rules', '动作规则')} key="action">
            <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
              <TriggerList />
            </ErrorBoundary>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
