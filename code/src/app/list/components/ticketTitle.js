import React, { Component } from 'react'
import { LoadingOutlined } from '@uyun/icons'
import { Spin, Tooltip, Tag } from '@uyun/components'
import { withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import { Circle } from 'rc-progress'
import qs from 'qs'
import { getCode } from '~/components/common/getPerUrl'
import { getOlaOverdueName, getSLATime, msToTime } from '~/logic/olaAndSla'
import list from '~/components/pageHeader/list'

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

// 工单来源
function getTicketSource(source) {
  let sourceName = ''
  switch (source) {
    case 'alert':
      sourceName = i18n('ticket.list.alert', 'alert')
      break
    case 'cmdb':
      sourceName = i18n('ticket.list.cmdb', 'cmdb')
      break
    case 'chatops':
      sourceName = i18n('ticket.list.chatops', 'chatops')
      break
    case 'wechat':
      sourceName = i18n('ticket.list.wechat', '微信')
      break
    case 'asset':
      sourceName = i18n('globe.asset', '资产')
      break
    case 'srvcat':
      sourceName = i18n('globe.catalog', '服务请求')
      break
    case 'import':
      sourceName = i18n('globe.import', '工单导入')
      break
    case 'other':
      sourceName = i18n('globe.other', '其他')
      break
    case 'web':
      sourceName = 'itsm'
      break
    default:
      break
  }
  return `${i18n('ticket.list.source', '来源')}:${sourceName}`
}

function getSlaMessage(record) {
  const { overdue, color, overdueTime, percent, overdueTimeUnit } = record
  const statusName =
    overdue === 'true'
      ? i18n('ticket.list.overdue.status1', '已逾期')
      : i18n('almost.overdue', '即将逾期')
  const trailColor = overdue === 'true' ? color || '#FFAE2F' : color || '#2DB7F5'
  let time = ''
  if (overdueTimeUnit === 'DAYS') {
    time = overdueTime + i18n('ticket.list.day', '天')
  } else {
    time = msToTime(overdueTime)
  }
  return {
    statusName,
    color: trailColor,
    time: time,
    percent
  }
}

function getOlaMessage(olaInfoVo) {
  const { overdueStatus, overdueTime, markColor } = olaInfoVo
  const statusName = getOlaOverdueName(overdueStatus)

  return {
    statusName,
    time: overdueTime,
    color: markColor,
    percent: '100'
  }
}
@withRouter
@observer
class TicketTitle extends Component {
  renderSLA = (record) => {
    let data = null
    let type = ''
    let dataSla = null
    let typeSla = ''

    // ola只显示已逾期
    if (record.olaInfoVo && record.olaInfoVo.overdueStatus === 2) {
      type = 'OLA'
      data = getOlaMessage(record.olaInfoVo)
    }
    if (record.strategyId) {
      typeSla = 'SLA'
      dataSla = getSlaMessage(record)
    }

    if (data || dataSla) {
      const style = {
        position: 'relative',
        top: 2,
        margin: '0 5px',
        width: 14,
        height: 14,
        cursor: 'pointer'
      }
      return (
        <>
          {record.strategyId ? (
            dataSla?.percent === '100' ? (
              <Tooltip
                placement="top"
                title={`${typeSla} ${dataSla?.statusName}: ${dataSla?.time}`}
              >
                <Tag
                  color={dataSla?.color}
                  style={{
                    border: `1px solid ${dataSla?.color}`,
                    backgroundColor: hexToRgb(dataSla?.color, 0.3),
                    color: dataSla?.color
                  }}
                >
                  逾期
                </Tag>
              </Tooltip>
            ) : (
              <Tooltip
                placement="top"
                title={`${typeSla} ${dataSla?.statusName}: ${dataSla?.time}`}
              >
                <Circle
                  style={style}
                  percent={dataSla?.percent}
                  strokeWidth="18"
                  trailWidth="18"
                  strokeColor={dataSla?.color}
                  trailColor={hexToRgb(dataSla?.color)}
                />
              </Tooltip>
            )
          ) : null}
          {record.olaInfoVo && record.olaInfoVo.overdueStatus === 2 ? (
            data?.percent === '100' ? (
              <Tooltip placement="top" title={`${type} ${data?.statusName}: ${data?.time}`}>
                <Tag
                  color={data?.color}
                  style={{
                    border: `1px solid ${data?.color}`,
                    backgroundColor: hexToRgb(data?.color, 0.3),
                    color: data?.color
                  }}
                >
                  逾期
                </Tag>
              </Tooltip>
            ) : (
              <Tooltip placement="top" title={`${type} ${data?.statusName}: ${data?.time}`}>
                <Circle
                  style={style}
                  percent={data?.percent}
                  strokeWidth="18"
                  trailWidth="18"
                  strokeColor={data?.color}
                  trailColor={hexToRgb(data?.color)}
                />
              </Tooltip>
            )
          ) : null}
        </>
      )
    }

    return null
  }

  // 子流程icon
  renderSubProcess(record) {
    if (record.subTicket === 1) {
      return (
        <Tooltip placement="top" title={i18n('ticket.list.SubProcess', '子流程')}>
          <Tag className="sub-tag">{i18n('ticket.list.SubProcess', '子流程')}</Tag>
        </Tooltip>
      )
    }
    return null
  }

  // 工单来源icon
  renderSource(record) {
    if (_.includes(['alert', 'cmdb', 'chatops', 'wechat', 'srvcat'], record.source)) {
      return (
        <Tooltip placement="top" title={getTicketSource(record.source, i18n)}>
          <Tag className="source-tag">外部</Tag>
        </Tooltip>
      )
    }
    return null
  }

  renderOperation = (record) => {
    if (record.rollbackMark === 'rollback') {
      return (
        <Tooltip placement="top" title="回退">
          <Tag className="rollback-tag">回退</Tag>
        </Tooltip>
      )
    }
    return null
  }

  renderDaraft = (draft) => {
    if (draft) {
      return (
        <Tooltip placement="top" title="草稿">
          <Tag className="draft-tag">草稿</Tag>
        </Tooltip>
      )
    }
  }
  renderTicketname = (text) => {
    const { wrapType, width, renderColumnBywrapTypeMap, record, isHandling } = this.props
    const { rollbackMark, draft, source, subTicket, strategyId, olaInfoVo } = record
    let tagCount =
      Number(Boolean(draft)) +
      Number(Boolean(rollbackMark === 'rollback')) +
      Number(Boolean(subTicket === 1)) +
      Number(Boolean(strategyId)) +
      Number(Boolean(olaInfoVo && olaInfoVo.overdueStatus === 2))
    //isHandling
    //      Number(Boolean(_.includes(['alert', 'cmdb', 'chatops', 'wechat', 'srvcat'], source))) +
    let tagAndBtnWidth = (32 + 8) * tagCount + 8
    if (isHandling) {
      tagAndBtnWidth += tagAndBtnWidth + 12
    }
    if (_.includes(['alert', 'cmdb', 'chatops', 'wechat', 'srvcat'], source)) {
      tagAndBtnWidth += 44
    }
    let breakWidth = width - tagAndBtnWidth
    return renderColumnBywrapTypeMap({ text, width: breakWidth, wrapType })
  }
  handleClick = (type) => {
    const {
      ticketId,
      tacheNo,
      tacheType,
      processId,
      subModelId,
      tacheId,
      caseId,
      externalURL,
      draft,
      ticketName
    } = this.props.record
    const {
      menuList: { ticketMenuList }
    } = this.props.globalStore
    const code = getCode(this.props.location.pathname)
    const menu =
      _.find(ticketMenuList, (item) => item.code === code) ||
      _.find(list(i18n), (item) => item.value === code) ||
      {}
    const isAgile = this.props.location.pathname.includes('ticket/agile')
    const search = {
      tacheNo: tacheNo || 0,
      tacheType: tacheType,
      tacheId: tacheId,
      modelId: subModelId || processId,
      caseId: caseId,
      isDrafts: draft,
      isAgile
    }
    if (this.props.source === 'npm') {
      this.props.handleTicketDetail(
        `/itsm/#/ticketDetail/${ticketId}?${qs.stringify(search)}`,
        ticketName,
        type
      )
      return false
    }
    if (externalURL) {
      window.open(externalURL)
      return false
    }
    if (type === 'newTab') {
      // 带头部以及左侧菜单
      // window.open(`/#/ticket/detail/${ticketId}?${qs.stringify(search)}`)
      // 不带头部以及左侧带单
      window.open(`./ticket.html#/ticket/detail/${ticketId}?${qs.stringify(search)}`)
      return false
    }
    this.props.history.push({
      pathname: `/ticket/detail/${ticketId}`,
      search: `?${qs.stringify(search)}`,
      state: {
        fromHase: this.props.location.pathname,
        fromName: menu.name || (window.language === 'zh_CN' ? menu.zhName : menu.enName)
      }
    })
  }

  render() {
    const { isHandling, record, isNewTab, wrapType } = this.props
    const { ticketName, draft } = record
    const isAgile = this.props.location.pathname.includes('ticket/agile') || isNewTab
    // const isPortal = window.location.href.includes('portal')
    return (
      <div className={`table-title ${wrapType}`}>
        {/* <a
          style={{ marginRight: 3 }}
          title={ticketName}
          onClick={() => {
            this.handleClick(isAgile ? 'newTab' : 'current')
          }}
        > */}
        <span className="ticket-name">{this.renderTicketname(ticketName)}</span>
        {/* </a> */}
        {this.renderDaraft(draft)}
        {/* {draft && (
          <i style={{ fontSize: 12, marginRight: 8 }} className="iconfont icon-yijianfankui" />
        )} */}
        {isHandling && <Spin spin indicator={<LoadingOutlined style={{ fontSize: 12 }} />} />}
        {this.renderSLA(record)}
        {this.renderSubProcess(record)}
        {this.renderSource(record)}
        {this.renderOperation(record)}
      </div>
    )
  }
}
export default TicketTitle
