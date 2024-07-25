import React, { Component } from 'react'
import { Alert, message, Modal } from '@uyun/components'
import JobDetail from './jobDetail'
import RetryJob from './retryJob'
import '../style/head.less'
import _ from 'lodash'

class JobInfo extends Component {
  static defaultProps = {
    autoJobInfo: {},
    detailForms: {},
    handleModifyTicket: () => {}
  }

  state = {
    detailVisible: false,
    retryVisible: false,
    loading: false,
    destroy: true,
    failRes: {}
  }

  handleJob = (isJob) => {
    if (isJob) {
      const { autoJobInfo } = this.props
      // 表单中判断自动节点是否可以侧滑打开automation页面
      axios.get(API.isExistJob, { params: { jobId: autoJobInfo.jobId } }).then((res) => {
        if (_.get(res, 'isExist')) {
          this.setState({
            detailVisible: true
          })
        } else {
          message.info(_.get(res, 'message'))
        }
      })
    } else {
      this.setState({
        retryVisible: true
      })
    }
  }

  onOk = () => {
    const { getTicketValues, detailForms, handleModifyTicket } = this.props
    const form = getTicketValues()
    const { ticketId, tacheId, caseId } = detailForms
    this.setState({ loading: true })
    axios.post(API.generateJob, { form, ticketId, activityId: tacheId, caseId }).then((res) => {
      if (res) {
        const { executeResult } = res
        if (executeResult) {
          this.setState(
            {
              retryVisible: false,
              destroy: true,
              loading: false
            },
            () => {
              message.success('生成作业成功')
              handleModifyTicket(false)
            }
          )
        } else {
          this.setState({ failRes: res, loading: false, destroy: false })
        }
      }
    })
  }

  handleSkip = () => {
    const { detailForms, handleModifyTicket } = this.props
    const { ticketId, tacheId } = detailForms
    Modal.confirm({
      title: i18n('skip.the.production.automation.task', '你确定要跳过生产自动化作业吗？'),
      onOk: () => {
        axios.post(API.auto_activity_jump(ticketId, tacheId)).then((res) => {
          if (res === '200') {
            handleModifyTicket('skip')
            message.success(i18n('skip.success'))
          } else {
            message.error(i18n('skip.failed'))
          }
        })
      }
    })
  }

  render() {
    const { detailVisible, retryVisible, loading, destroy, failRes } = this.state
    const { autoJobInfo, detailForms } = this.props
    const { jobGeneratedFlag } = autoJobInfo
    const isJob = jobGeneratedFlag === 1
    if (jobGeneratedFlag === 2) return null
    if (detailForms.activityType !== 'AutoTask' || !_.isNumber(jobGeneratedFlag)) return null
    return (
      <div className="job-info-alert">
        <Alert
          message={
            <>
              {isJob
                ? '自动化作业处理中，工单暂处于挂起状态'
                : '未关联到自动化作业，工单暂处于挂起状态'}
              <a onClick={() => this.handleJob(isJob)}>{isJob ? '查看作业' : '生成作业'}</a>
              {!isJob && (
                <a onClick={this.handleSkip} style={{ marginRight: 10 }}>
                  {i18n('status_22', '跳过')}
                </a>
              )}
            </>
          }
          type={isJob ? 'info' : 'warning'}
          style={{ width: 450, marginBottom: 5 }}
          showIcon
        />
        <JobDetail
          visible={detailVisible}
          info={autoJobInfo}
          detailForms={detailForms}
          getDetailForms={this.props.getDetailForms}
          onClose={() => this.setState({ detailVisible: false })}
        />
        <RetryJob
          visible={retryVisible}
          loading={loading}
          destroy={destroy}
          failRes={failRes}
          detailForms={detailForms}
          onCancel={() => this.setState({ retryVisible: false, loading: false, destroy: true })}
          onOk={() => this.onOk()}
          handleModifyTicket={() => {
            this.setState({ retryVisible: false, destroy: true })
            this.props.handleModifyTicket(true)
          }}
        />
      </div>
    )
  }
}

export default JobInfo
