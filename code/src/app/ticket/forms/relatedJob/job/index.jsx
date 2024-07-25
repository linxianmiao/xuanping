import React, { Component } from 'react'
import { inject } from 'mobx-react'
import { Empty, Modal } from '@uyun/components'
import Actions from './Actions'
import JobModal from './Modal'
import Detail from './Detail'
import Table from './Table'
import _ from 'lodash'

@inject('ticketFieldJobStore', 'globalStore')
class Job extends Component {
  static defaultProps = {
    // value: [],
    onChange: () => {},
    disabled: false,
    field: {},
    ticketId: ''
  }

  state = {
    iframeType: '', // 当前展现的iframe动作类型
    id: '' // 当前正在处理的数据id (定时作业/执行计划/作业)
  }

  handleClose = () => {
    this.setState({ iframeType: '', id: '' })
  }

  handleModalOk = (value) => {
    this.props.ticketFieldJobStore.setValue(value, 'jobList')
    this.props.onChange(value)
    this.handleClose()
  }

  // type 1:定时作业 2:执行计划
  handleDelete = (id, type) => {
    const { ticketId } = this.props
    Modal.confirm({
      title: i18n('job.delete.confirm.tip', '确定要删除该作业吗？'),
      onOk: async () => {
        await this.props.ticketFieldJobStore.job_delete(id, type, 1, ticketId)

        const { value } = this.props
        const nextValue = value.filter((item) => item.id !== id)
        this.props.onChange(nextValue)
      }
    })
  }

  // 刷新状态
  handleRefresh = async (id) => {
    const { value, ticketId } = this.props
    const jobId = _.filter(value, (item) => item.id === id)[0]?.jobId
    const res = await this.props.ticketFieldJobStore.refreshJobPlan(ticketId, jobId)
    let nextValue = value
    if (res && !_.isEmpty(res)) {
      nextValue = value.map((item) => {
        if (item.id === id) {
          item.status = res?.currentJobStatus
        }
        return item
      })
      this.props.onChange(nextValue)
      const status = _.map(nextValue, (item) => item.status)
      if (
        !_.includes(status, -1) &&
        !_.includes(status, 0) &&
        !_.includes(status, 4) &&
        !_.includes(status, 10)
      ) {
        console.log('刷新页面')
        this.props.getAgainDetailForms && this.props.getAgainDetailForms()
      }
    }
  }

  render() {
    const { field, disabled, value, ticketId, jobList, modelId, modelCode } = this.props
    const { iframeType, id } = this.state
    if (this.props.globalStore.productNum.automation !== 1) {
      return (
        <Empty
          type="privilege"
          description={i18n('ticket.field.relateJob.tip1', '无Automation权限，请联系管理员开通')}
        />
      )
    }

    return (
      <div id={field.code}>
        <Actions
          disabled={disabled}
          field={field}
          onClick={(actionType) => {
            let iframeType = ''

            switch (actionType) {
              case '1':
                iframeType = 'plan-create'
                break
              case '2':
                iframeType = 'timer-create'
                break
              case '3':
                iframeType = 'timer-list'
                break
              default:
                break
            }

            this.setState({ iframeType })
          }}
        />

        <Table
          disabled={disabled}
          isRequired={field.isRequired}
          data={value}
          jobList={jobList}
          onEdit={(id, iframeType) => this.setState({ id, iframeType })}
          onView={(id, iframeType) => this.setState({ id, iframeType })}
          onDelete={this.handleDelete}
          onRefresh={this.handleRefresh}
        />

        <JobModal
          iframeType={iframeType}
          id={id}
          value={value}
          ticketId={ticketId}
          modelId={modelId}
          modelCode={modelCode}
          onClose={this.handleClose}
          onOk={this.handleModalOk}
        />

        <Detail iframeType={iframeType} id={id} onClose={this.handleClose} />
      </div>
    )
  }
}
export default Job
