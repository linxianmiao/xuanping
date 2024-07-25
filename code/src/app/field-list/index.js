import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Tabs } from '@uyun/components'
import PageHeader from '~/components/pageHeader'
import ErrorBoundary from '~/components/ErrorBoundary'
import ContentLayout from '~/components/ContentLayout'
import Extend from './extend'
import Builtin from './builtin'
import styles from './index.module.less'

@inject('fieldListStore')
@observer
class FieldList extends Component {
  componentDidMount() {
    window.LOWCODE_APP_KEY = this.props.appkey
  }
  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }
  render() {
    const { fieldListStore } = this.props
    const { activeKey } = fieldListStore
    return (
      <div className={styles.fieldListIndex}>
        <PageHeader />
        <ContentLayout>
          <ErrorBoundary desc={i18n('fieldListFail', '工单列表加载失败')}>
            <Tabs
              activeKey={activeKey}
              onChange={(key) => fieldListStore.setProps({ activeKey: key })}
            >
              <Tabs.TabPane key="2" tab={i18n('entend_field', '扩展字段')}>
                <Extend appkey={this.props.appkey} />
              </Tabs.TabPane>
              <Tabs.TabPane key="1" tab={i18n('builtin_field', '内置字段')}>
                <Builtin appkey={this.props.appkey} />
              </Tabs.TabPane>
            </Tabs>
          </ErrorBoundary>
        </ContentLayout>
      </div>
    )
  }
}

export default FieldList
