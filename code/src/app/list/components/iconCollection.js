import React, { Component } from 'react'
import { Tooltip } from '@uyun/components'
import { Circle } from 'rc-progress'

// 将16进制的颜色转成rgba
function hexToRgb (hex, opacity = 0.2) {
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
function getSLATime (time) {
  const day = parseInt(time / (60 * 24)) > 0
    ? parseInt(time / (60 * 24)) + i18n('ticket.list.day', '天') : ''
  const hours = parseInt((time % (60 * 24)) / (60)) > 0
    ? parseInt((time % (60 * 24)) / (60)) + i18n('ticket.list.hours', '小时') : ''
  const min = (time % 60) > 0 ? (time % 60) + i18n('ticket.list.min', '分')
    : '0' + i18n('ticket.list.min', '分')
  return day + hours + min
}

// 工单来源
function getTicketSource (source) {
  let sourceName = ''
  switch (source) {
    case 'alert' : sourceName = i18n('ticket.list.alert', 'alert'); break
    case 'cmdb' : sourceName = i18n('ticket.list.cmdb', 'cmdb'); break
    case 'chatops' : sourceName = i18n('ticket.list.chatops', 'chatops'); break
    case 'wechat' : sourceName = i18n('ticket.list.wechat', '微信'); break
    case 'asset':sourceName = i18n('globe.asset', '资产'); break
    case 'srvcat' : sourceName = i18n('globe.catalog', '服务请求'); break
    case 'import' : sourceName = i18n('globe.import', '工单导入'); break
    case 'other' : sourceName = i18n('globe.other', '其他'); break
    case 'web' : sourceName = 'itsm'; break
  }
  return `${i18n('ticket.list.source', '来源')}:${sourceName}`
}

function getMessage (record) {
  const title = record.overdue === 'true' ? i18n('ticket.list.overdue', '已逾期：') : i18n('ticket.list.residue', '即将逾期:')
  const trailColor = record.overdue === 'true' ? record.color ? record.color : '#FFAE2F' : record.color ? record.color : '#2DB7F5'
  return {
    title,
    trailColor
  }
}
export default class IconCollection extends Component {
    getSLADOM = record => {
      const { title, trailColor } = getMessage(record)
      return (
        <Tooltip placement="top" title={`${title}${getSLATime(record.overdueTime)}`}>
          <Circle
            style={{ cursor: 'pointer', width: 14, height: 14, margin: '0 5px' }}
            percent={record.percent}
            strokeWidth="18"
            trailWidth="18"
            strokeColor={trailColor}
            trailColor={hexToRgb(trailColor)} />
        </Tooltip>
      )
    }

    // 子流程icon
    createSubProcess (record) {
      return (
        <Tooltip placement="top" title={i18n('ticket.list.SubProcess', '子流程')}>
          <i className="iconfont icon-ziliucheng" />
        </Tooltip>
      )
    }

    // 工单来源icon
    createSource (record) {
      return (
        <Tooltip placement="top" title={getTicketSource(record.source)}>
          <i className={`${record.source} iconfont btn-available`} />
        </Tooltip>
      )
    }

    renderOperation = () => {
      return (
        <Tooltip placement="top" title="回退">
          <i className="iconfont icon-chehuisekuai" />
        </Tooltip>
      )
    }

    render () {
      const { record } = this.props
      const { strategyId, subTicket, source, rollbackMark } = record
      return (
        <div className="ticket-list-td-icon-collection">
          { strategyId && this.getSLADOM(record) }
          { subTicket === 1 && this.createSubProcess(record) }
          { !_.includes(['web', 'import', 'asset'], source) && this.createSource(record)}
          {rollbackMark === 'rollback' && this.renderOperation()}
        </div>
      )
    }
}
