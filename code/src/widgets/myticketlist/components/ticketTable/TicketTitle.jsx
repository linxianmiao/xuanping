import React, { Component } from 'react'
import { Tooltip } from '@uyun/components'
import { RollbackOutlined } from '@uyun/icons'
import qs from 'qs'
import { Circle } from 'rc-progress'
import { icons } from './icons'
import styles from '../../ticketlist.module.less'
const OpenSvg = () => (
  <svg fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24">
    <defs>
      <clipPath id="master_svg0_325_65996">
        <rect x="0" y="0" width="24" height="24" rx="0" />
      </clipPath>
    </defs>
    <g clip-path="url(#master_svg0_325_65996)">
      <g>
        <path
          d="M10.330859375,15.4804675C9.667578375,15.4804675,9.130859375,14.9437475,9.130859375,14.2804675L9.130859375,7.8796875C9.130859375,7.2164065,9.667578375,6.6796875,10.330859375,6.6796875L16.731639375,6.6796875C17.394919375,6.6796875,17.931639375,7.2164065,17.931639375,7.8796875L17.931639375,14.2804675C17.931639375,14.9437475,17.394919375,15.4804675,16.731639375,15.4804675L10.330859375,15.4804675ZM10.330859375,14.2804675L16.731639375,14.2804675L16.731639375,9.0468775L10.330859375,9.0468775L10.330859375,14.2804675Z"
          fill="#0758BE"
          fill-opacity="1"
        />
      </g>
      <g>
        <path
          d="M13.530080625,15.480464999999999L13.530080625,16.647655L7.131640625,16.647655L7.131640625,11.414065L9.130860625,11.414065L9.130860625,9.046875L7.131640625,9.046875C6.468359625,9.046875,5.931640625,9.583594,5.931640625,10.246875L5.931640625,16.647655C5.931640625,17.310935,6.468359625,17.847655,7.131640625,17.847655L13.532420625,17.847655C14.195700625,17.847655,14.732420625,17.310935,14.732420625,16.647655L14.732420625,15.480464999999999L13.530080625,15.480464999999999Z"
          fill="#0758BE"
          fill-opacity="1"
        />
      </g>
    </g>
  </svg>
)
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
  const min = time % 60 > 0 ? (time % 60) + '分' : '0分'
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
    default:
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
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
  }

  sideBar = () => {
    this.setState({
      visible: true
    })
  }

  onClose = () => {
    this.setState({
      visible: false
    })
  }

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
          <span className="uyunicon">{icons['ZiLiuCheng']}</span>
        </Tooltip>
      )
    }
    return null
  }

  // 工单来源icon
  renderSource(record) {
    if (_.includes(['alert', 'cmdb', 'chatops', 'wechat', 'srvcat'], record.source)) {
      return (
        <Tooltip placement="top" title={getTicketSource(record.source)}>
          <i className={`uyunicon btn-available`}>{icons[record.source]}</i>
        </Tooltip>
      )
    }
    return null
  }

  renderOperation = (record) => {
    if (record.rollbackMark === 'rollback') {
      return (
        <Tooltip placement="top" title="回退">
          <RollbackOutlined style={{ color: '#ff8c3d' }} />
        </Tooltip>
      )
    }
    return null
  }

  handleClick = () => {
    const { ticketId, appInfoVo, id } = this.props.record
    let src = `/itsm/#/ticketDetail/${ticketId}/?ticketSource=portal&hideHeader=1&hideHead=1&hideMenu=1`
    if (this.props?.source === 'mydrafts') {
      src = `/itsm/#/ticket/drafts/${id}/?ticketSource=portal&hideHeader=1&hideHead=1&hideMenu=1`
    }

    if (appInfoVo?.appkey) {
      src += `&appkey=${appInfoVo?.appkey}`
    }
    window.open(src)
  }

  render() {
    const { record, children, source } = this.props
    return (
      <>
        <Tooltip title={children} placement="topLeft">
          <a
            onClick={() =>
              this.props.handleDetailTicket(record, source === 'mydrafts' ? 'mydrafts' : 'detail')
            }
            className={styles.tableText}
            id="flowNo"
          >
            <span>{children}</span>
          </a>
        </Tooltip>
        <Tooltip placement="top" title="新窗口打开工单">
          <span
            className="uyunicon"
            style={{ fontSize: 16 }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              this.handleClick()
            }}
          >
            <OpenSvg />
          </span>
        </Tooltip>
      </>
    )
  }
}
export default TicketTitle
