import React, { Component } from 'react'
import { Table, Button } from '@uyun/components'
import _ from 'lodash'

const ButtonGroup = Button.Group
export default class JobTable extends Component {
  static defaultProps = {
    data: [],
    disabled: false,
    onEdit: () => {},
    onDelete: () => {},
    onView: () => {}
  }

  renderPlanStatus = (status) => {
    switch (+status) {
      case -2:
        return '超时失效'
      case -1:
        return '未启用'
      case 0:
        return '待审核'
      case 1:
        return (
          <span className="executing">
            <i className="icon-zhengzaizhihang iconfont" />
            正在执行
          </span>
        )
      case 2:
        return (
          <span className="success">
            <i className="icon-zhixingchenggong iconfont" />
            执行成功
          </span>
        )
      case 3:
        return '已删除'
      case 4:
        return (
          <span className="await">
            <i className="icon-time-circle iconfont" />
            等待执行
          </span>
        )
      case 6:
        return '编排错误'
      case 7:
        return '已取消'
      case 8:
        return '执行终止'
      case 9:
        return (
          <span className="error">
            <i className="icon-guanbi1 iconfont" />
            执行错误
          </span>
        )
      case 10:
        return '未启用'
      default:
        return ''
    }
  }

  renderTimerStatus = (status) => {
    switch (+status) {
      case 0:
        return '未启用'
      case 1:
        return '待审核'
      case 3:
        return '启用'
      case 5:
        return '删除'
      default:
        return ''
    }
  }

  render() {
    const { data, disabled, jobList, isRequired } = this.props
    // 详情返回的defaultValue关联作业列表里没有creator这个字段，需要从jobList里取
    _.forEach(data, (job) => {
      _.forEach(jobList, (job2) => {
        if (job.id === job2.id) {
          job.creator = job2.creator
        }
      })
    })
    if (!data || data.length === 0) {
      return null
    }

    const columns = [
      {
        title: i18n('job-name', '作业名称'),
        dataIndex: 'name',
        render: (text, record) => {
          const { id, actionType, status } = record
          const isTimer = actionType === 1 || actionType === 3

          if (isTimer) {
            return <a onClick={() => this.props.onView(id, 'timer-detail')}>{text}</a>
          } else if (status === 0 || status === 4) {
            // 执行计划为待审核、待执行时，可查看详情
            return <a onClick={() => this.props.onView(id, 'plan-detail')}>{text}</a>
          }
          return text
        }
      },
      {
        title: i18n('job-creator', '创建人'),
        dataIndex: 'creator'
      },
      {
        title: '类型',
        dataIndex: 'actionType',
        render: (actionType) => {
          switch (String(actionType)) {
            case '1':
            case '3':
              return '定时作业'
            case '2':
              return '执行计划'
            default:
              return ''
          }
        }
      },
      {
        title: i18n('job-status', '状态'),
        dataIndex: 'status',
        className: 'itsm-field-job-table-status',
        render: (status, record) => {
          if (record.actionType === 2) {
            return this.renderPlanStatus(status)
          }
          return this.renderTimerStatus(status)
        }
      },
      {
        title: i18n('conf.model.proces.settingUser', '执行人'),
        dataIndex: 'execUserName'
      },
      {
        title: i18n('start.time', '开始时间'),
        dataIndex: 'startTime'
      },
      {
        title: i18n('end.time', '结束时间'),
        dataIndex: 'endTime'
      },
      {
        title: i18n('globe.opera', '操作'),
        render: (record) => {
          const { id, jobId, status, actionType } = record

          const isPlan = actionType === 2
          const isTimer = actionType === 1 || actionType === 3
          const isCreateTimer = actionType === 1
          const isStopTimer = actionType === 3
          const iframeType = isTimer ? 'timer-edit' : 'plan-edit'

          // 执行计划未启用时可以编辑和删除
          // 创建定时作业，未启用时，可以编辑和删除
          // 停用定时作业，未停用前，可以删除
          const canEdit =
            (isCreateTimer && status === 0) || (isPlan && (status === -1 || status === 10))
          const canDelete =
            (isCreateTimer && status === 0) ||
            (isStopTimer && status === 3) ||
            (isPlan && (status === -1 || status === 10))
          // 执行计划 未启用/待审核/已取消 时，不能查看作业
          // 定时作业启用时能查看作业
          const canView =
            (isTimer && status === 3) ||
            (isPlan &&
              status !== -2 &&
              status !== -1 &&
              status !== 0 &&
              status !== 7 &&
              status !== 4 &&
              status !== 10)

          // 能否刷新

          const canRefresh =
            window.location.href.indexOf('createTicket') === -1 &&
            (actionType === 2
              ? _.includes([-1, 0, 1, 4, 10], status)
              : _.includes([0, 1, 3], status))

          return (
            <ButtonGroup type="link">
              {canEdit && !disabled && (
                <a
                  disabled={disabled || isRequired === 2}
                  onClick={() => {
                    if (disabled || isRequired === 2) {
                      return false
                    }
                    this.props.onEdit(id, iframeType)
                  }}
                >
                  {i18n('edit', '编辑')}
                </a>
              )}
              {canDelete && !disabled && (
                <a
                  disabled={disabled || isRequired === 2}
                  onClick={() => {
                    if (disabled || isRequired === 2) {
                      return false
                    }
                    this.props.onDelete(id, isTimer ? 1 : 2)
                  }}
                >
                  {i18n('delete', '删除')}
                </a>
              )}
              {canView && (
                <a onClick={() => this.props.onView(jobId, isTimer ? 'timer-job' : 'plan-job')}>
                  {i18n('job-detail', '作业查看')}
                </a>
              )}
              {canRefresh && (
                <a onClick={() => this.props.onRefresh(id)} disabled={isRequired === 2}>
                  {i18n('refresh-status', '刷新状态')}
                </a>
              )}
            </ButtonGroup>
          )
        }
      }
    ]

    return (
      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={data}
        pagination={false}
        size="small"
      />
    )
  }
}
