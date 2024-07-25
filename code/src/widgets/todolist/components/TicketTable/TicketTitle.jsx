import React, { Component } from 'react'
import { Drawer, Tooltip } from '@uyun/components'
import { Circle } from 'rc-progress'
import styles from '../TicketHeader/index.module.less'

// 将16进制的颜色转成rgba
function hexToRgb(hex, opacity = 0.2) {
  var h = hex.replace('#', '')
  h = h.match(new RegExp('(.{' + h.length / 3 + '})', 'g'))
  for (var i = 0; i < h.length; i++) {
    h[i] = parseInt(h[i].length === 1 ? h[i] + h[i] : h[i], 16)
  }
  if (typeof opacity !== 'undefined') {
    h.push(opacity)
  }
  return 'rgba(' + h.join(',') + ')'
}
// 获取SLA的超时时间
function getSLATime(time) {
  const day = parseInt(time / (60 * 24)) > 0 ? parseInt(time / (60 * 24)) + '天' : ''
  const hours =
    parseInt((time % (60 * 24)) / 60) > 0 ? parseInt((time % (60 * 24)) / 60) + '小时' : ''
  const min = time % 60 > 0 ? (time % 60) + '分' : '0' + '分'
  return day + hours + min
}

// 工单来源
function getTicketSource(source) {
  let sourceName = ''
  switch (source) {
    case 'alert':
      sourceName = 'Alert'
      break
    case 'cmdb':
      sourceName = 'CMDB'
      break
    case 'chatops':
      sourceName = 'Chatops'
      break
    case 'wechat':
      sourceName = '微信'
      break
    case 'asset':
      sourceName = '资产'
      break
    case 'srvcat':
      sourceName = '服务请求'
      break
    case 'import':
      sourceName = '工单导入'
      break
    case 'other':
      sourceName = '其他'
      break
    case 'web':
      sourceName = 'ITSM'
      break
  }
  return `来源:${sourceName}`
}

function getMessage(record) {
  const title = record.overdue === 'true' ? '已逾期：' : '即将逾期：'
  const trailColor =
    record.overdue === 'true'
      ? record.color
        ? record.color
        : '#FFAE2F'
      : record.color
      ? record.color
      : '#2DB7F5'
  return {
    title,
    trailColor
  }
}
class TicketTitle extends Component {
  renderSLA = (record) => {
    if (record.strategyId) {
      const { title, trailColor } = getMessage(record)
      return (
        <Tooltip placement="top" title={`${title}${getSLATime(record.overdueTime)}`}>
          <Circle
            style={{ cursor: 'pointer', width: 14, height: 14, margin: '0 5px' }}
            percent={record.percent}
            strokeWidth="18"
            trailWidth="18"
            strokeColor={trailColor}
            trailColor={hexToRgb(trailColor)}
          />
        </Tooltip>
      )
    }
    return null
  }

  // 子流程icon
  renderSubProcess(record) {
    if (record.subTicket === 1) {
      return (
        <Tooltip placement="top" title="子流程">
          <i className="iconfont icon-ziliucheng" />
        </Tooltip>
      )
    }
    return null
  }

  // 工单来源icon
  renderSource(record) {
    if (_.includes(['alert', 'cmdb', 'chatops', 'wechat'], record.source)) {
      return (
        <Tooltip placement="top" title={getTicketSource(record.source)}>
          <i className={`${record.source} iconfont btn-available`} />
        </Tooltip>
      )
    }
    if (_.includes(['srvcat'], record.source)) {
      return (
        <Tooltip placement="top" title={getTicketSource(record.source)}>
          <i className="icon-menhuguanli iconfont" />
        </Tooltip>
      )
    }
    return null
  }

  renderOperation = (record) => {
    if (record.rollbackMark === 'rollback') {
      return (
        <Tooltip placement="top" title="回退">
          <i style={{ color: '#ff8c3d' }} className="iconfont icon-chehuisekuai" />
        </Tooltip>
      )
    }
    return null
  }

  render() {
    const { record, typeSource, handelTicketDetail } = this.props
    const {
      ticketId,
      tacheNo = 0,
      tacheType,
      processId,
      subModelId,
      tacheId,
      caseId,
      ticketName,
      draft
    } = this.props.record
    const modelId = subModelId || processId

    return (
      <a
        onClick={() =>
          handelTicketDetail(true, {
            ticketId,
            ticketName,
            caseId,
            tacheId,
            modelId,
            tacheNo,
            tacheType
          })
        }
      >
        {typeSource === 'ticketNum' ? (
          record.ticketNum
        ) : (
          <>
            <span
              className="ticket-list-title"
              title={ticketName}
              onClick={() =>
                handelTicketDetail(true, {
                  ticketId,
                  ticketName,
                  caseId,
                  tacheId,
                  modelId,
                  tacheNo,
                  tacheType
                })
              }
            >
              {ticketName}
            </span>
            {draft && <i style={{ fontSize: 12 }} className="iconfont icon-yijianfankui" />}
            {this.renderSLA(record)}
            {this.renderSubProcess(record)}
            {this.renderSource(record)}
            {this.renderOperation(record)}
          </>
        )}
      </a>
    )
  }
}
export default TicketTitle
