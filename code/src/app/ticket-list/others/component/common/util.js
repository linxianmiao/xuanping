// 将16进制的颜色转成rgba
export function hexToRgb(hex, opacity = 0.2) {
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
export function getSLATime(time) {
  const day =
    parseInt(time / (60 * 24)) > 0 ? parseInt(time / (60 * 24)) + i18n('ticket.list.day', '天') : ''
  const hours =
    parseInt((time % (60 * 24)) / 60) > 0
      ? parseInt((time % (60 * 24)) / 60) + i18n('ticket.list.hours', '小时')
      : ''
  const min =
    time % 60 > 0
      ? (time % 60) + i18n('ticket.list.min', '分')
      : '0' + i18n('ticket.list.min', '分')
  return day + hours + min
}

// 毫秒转化成天时分秒
export function msToTimeAll(ms) {
  const second = Math.floor((ms % (60 * 1000)) / 1000)
  const minute = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  const hour = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const day = Math.floor(ms / (24 * 60 * 60 * 1000))
  return (
    (day > 0 ? day + i18n('ticket.list.day', '天') : '') +
      (hour > 0 ? hour + i18n('ticket.list.hours', '小时') : '') +
      (minute > 0 ? minute + i18n('ticket.list.min', '分') : '') +
      (second > 0 ? second + i18n('globe.seconds', '秒') : '') ||
    '0' + i18n('ticket.list.min', '分')
  )
}

// 毫秒转化为时分秒
export function msToTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor(ms / (1000 * 60 * 60))
  return (
    (hours > 0 ? hours + i18n('ticket.list.hours', '小时') : '') +
      (minutes > 0 ? minutes + i18n('ticket.list.min', '分') : '') +
      (seconds > 0 ? seconds + i18n('globe.seconds', '秒') : '') ||
    '0' + i18n('ticket.list.min', '分')
  )
}

// 工单来源
export function getTicketSource(source) {
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
    case 'catalog':
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
  }
  return `${i18n('ticket.list.source', '来源')}:${sourceName}`
}

export function getStatusColor(status) {
  let color = ''
  let name = ''
  switch (status) {
    case 7:
      name = i18n('ticket.list.status_7', '已关闭')
      color = '#24cbac'
      break // 已关闭
    case 3:
      name = i18n('ticket.list.status_3', '已完成')
      color = '#0549c5'
      break // 已完成
    case 2:
      name = i18n('ticket.list.status_2', '处理中')
      color = '#30d85c'
      break // 处理中
    case 10:
      name = i18n('ticket.list.status_10', '挂起')
      color = '#ec4e53'
      break // 挂起
    case 11:
      name = i18n('ticket.list.status_11', '已废除')
      color = '#f99c05'
      break // 已废除
    case 12:
      name = i18n('ticket.list.status_12', '已处理')
      color = '#0549c5'
      break // 已处理
    default:
      name = i18n('ticket.list.status_1', '待处理')
      color = '#4abafd'
      break // 待处理
  }
  return { name, color }
}
