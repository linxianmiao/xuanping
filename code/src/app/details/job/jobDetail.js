import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Drawer, Button, message } from '@uyun/components'

class JobDetail extends Component {
  static defaultProps = {
    visible: false,
    info: {},
    detailForms: {},
    getDetailForms: () => {},
    onClose: () => {}
  }

  state = {
    loading: false
  }

  handleSubmit = () => {
    const { info, detailForms, onClose, match } = this.props
    const { ticketId, tacheId } = detailForms
    this.setState({ loading: true })
    axios
      .post(API.resumeAndSubmit, { ticketId, activityId: tacheId, jobId: info.jobId })
      .then((res) => {
        if (res) {
          message.success('同步作业状态成功')
          onClose()
          this.props.history.push(match.url)
          this.props.getDetailForms(undefined, 'jobReload')
        }
        this.setState({ loading: false })
      })
  }

  render() {
    const { loading } = this.state
    const { visible, info, onClose, detailForms } = this.props
    const { jobDetailUrl } = info
    return (
      <Drawer
        title={i18n('ticket.detail.automation', '作业详情')}
        visible={visible}
        onClose={() => onClose()}
        className="job-detail-drawer"
      >
        {detailForms.activityType === 'AutoTask' ? (
          <div style={{ marginBottom: 5 }}>
            <Button
              onClick={() => this.handleSubmit()}
              loading={this.state.loading}
              style={{ marginRight: 5 }}
            >
              {loading ? '正在同步作业状态。。。' : '同步作业状态'}
            </Button>
            <span>{'点击按钮同步自动化作业状态并驱动流程自动流转'}</span>
          </div>
        ) : null}

        <iframe src={jobDetailUrl} width="100%" height="100%" scrolling="yes" frameBorder={0} />
      </Drawer>
    )
  }
}

export default withRouter(JobDetail)
