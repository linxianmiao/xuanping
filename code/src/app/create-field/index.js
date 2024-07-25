import React, { Component } from 'react'
import Header from './layout/header'
import Layout from './layout/index'
import { Prompt } from 'react-router-dom'
import PageHeader from '~/components/pageHeader'
import CreateStore from './store/createStore'
import ContentLayout from '~/components/ContentLayout'
import { qs } from '@uyun/utils'
import './style/createField.less'
import getURLParam from '~/utils/getUrl'

import ErrorBoundary from '~/components/ErrorBoundary'

const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 20 }
}
const createStore = new CreateStore()

class Index extends Component {
  state = {
    leaveNotify: false
  }

  componentDidMount() {
    window.LOWCODE_APP_KEY = getURLParam('appkey')
  }

  componentWillUnmount() {
    createStore.distory()
    window.LOWCODE_APP_KEY = ''
  }

  onValuesChange = (visible = true) => {
    this.setState({ leaveNotify: visible })
  }

  render() {
    const queryType = this.props.fieldCode || this.props.match.params.type

    const modelId = this.props.modelId || qs.parse(this.props.location.search.slice(1)).modelId
    const canModelOperate =
      this.props.canModelOperate || qs.parse(this.props.location.search.slice(1)).canModelOperate

    const diliver = {
      modelId,
      canModelOperate,
      queryType,
      formItemLayout,
      store: createStore,
      onValuesChange: this.onValuesChange
    }

    const prevRoute = modelId
      ? [
          { path: '/conf/model', name: i18n('layout.model', '模型管理') },
          {
            path: `/conf/model/advanced/${modelId}`,
            name: i18n('edit-model', '编辑模型'),
            state: { visibleKey: '5' }
          }
        ]
      : [{ path: '/conf/field', name: i18n('layout.fields', '字段管理') }]
    const currRoute = queryType
      ? { name: i18n('edit', '编辑') }
      : { name: i18n('layout.new', '新建') }

    return (
      <div className="files-wrap" id="files-wrap">
        {!window.LOWCODE_APP_KEY && <PageHeader customizeBreadcrumb={[...prevRoute, currRoute]} />}
        <ContentLayout>
          <Header {...diliver} />
          <ErrorBoundary desc={i18n('loadFail')}>
            <Layout {...diliver} />
          </ErrorBoundary>
          <Prompt when={this.state.leaveNotify} message="" />
        </ContentLayout>
      </div>
    )
  }
}

export default Index
