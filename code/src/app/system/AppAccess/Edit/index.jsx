import React, { Component } from 'react'
import { Prompt } from 'react-router-dom'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ErrorBoundary from '~/components/ErrorBoundary'
import leaveNotifyModal from '~/components/leaveNotifyModal'
import Form from './Form'

export default class Edit extends Component {
  state = {
    leaveNotify: true
  }
  //   leaveNotify = true

  //   handleLeaveNotify = location => {
  //     if (this.leaveNotify) {
  //       leaveNotifyModal('', () => {
  //         this.leaveNotify = false
  //         this.props.history.replace(location)
  //       })
  //       return false
  //     }
  //     return true
  //   }

  render() {
    return (
      <>
        <PageHeader
          customizeBreadcrumb={[
            { name: i18n('app.access', '应用接入'), path: '/sysCon/appAccess' },
            { name: i18n('app.config', '应用配置') }
          ]}
        />
        <ContentLayout>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <Form
              appCode={this.props.match.params.appCode}
              detail={this.props.location.state}
              onLeaveNotify={(leaveNotify) => this.setState({ leaveNotify })}
            />
          </ErrorBoundary>
        </ContentLayout>
        <Prompt message="确认离开？" when={this.state.leaveNotify} />
      </>
    )
  }
}
