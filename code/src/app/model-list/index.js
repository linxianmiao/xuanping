import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Tabs } from '@uyun/components'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ModelList from './ModelList'
import ReviewList from './ReviewList'
import ErrorBoundary from '~/components/ErrorBoundary'
import './index.less'
const TabPane = Tabs.TabPane

@inject('modelListStore', 'globalStore')
@observer
class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: 'tabA'
    }
  }

  componentDidMount() {
    const { configAuthor, showStatusButton } = this.props.globalStore
    window.LOWCODE_APP_KEY = this.props.appkey

    if (
      this.props.location &&
      this.props.location.state &&
      configAuthor.modelAuth &&
      !showStatusButton
    ) {
      // 从面包屑审批记录进来的数据默认回到模型审核页面
      this.changeMenu('tabB')
    }
  }

  componentWillUnmount() {
    this.props.modelListStore.dispose()
    window.LOWCODE_APP_KEY = ''
  }

  changeMenu = (key) => {
    this.setState({ active: key })
  }

  render() {
    const { configAuthor, showStatusButton } = this.props.globalStore
    const { active } = this.state
    const showTabs = configAuthor.modelAuth && !showStatusButton
    return (
      <div className="itsm-model-list-wrap">
        {!window.LOWCODE_APP_KEY && <PageHeader />}
        <ContentLayout heightFixed>
          <ErrorBoundary desc={i18n('loadFail')}>
            {showTabs ? (
              <Tabs activeKey={active} onChange={this.changeMenu}>
                <TabPane tab={i18n('model.list', '模型列表')} key={'tabA'} />
                <TabPane tab={i18n('model.review', '模型审核')} key={'tabB'} />
              </Tabs>
            ) : null}
            {active === 'tabA' && (
              <ModelList wrapperHeight={showTabs ? 'calc(100% - 57px)' : '100%'} />
            )}
            {active === 'tabB' && <ReviewList />}
          </ErrorBoundary>
        </ContentLayout>
      </div>
    )
  }
}
export default Index
