export function getSlaOverdueInfo(status) {
  let name = ''
  let color = ''
  switch (status) {
    case 0:
      name = i18n('ticket.list.overdue.status0', '未逾期')
      color = '#3CD768'
      break
    case 1:
      name = i18n('ticket.list.overdue.status1', '已逾期')
      color = '#ec4e53'
      break
    case 2:
      name = i18n('ticket.list.overdue.status2', '逾期已恢复')
      color = '#FFCD3D'
      break
    default:
      break
  }
  return { name, color }
}

export function getSlaOverdueName(status) {
  return getSlaOverdueInfo(status).name
}

export function getOlaOverdueInfo(status) {
  let name = ''
  let color = ''
  switch (status) {
    case 1:
      name = i18n('ticket.list.overdue.status0', '未逾期')
      color = '#3CD768'
      break
    case 2:
      name = i18n('ticket.list.overdue.status1', '已逾期')
      color = '#ec4e53'
      break
    case 3:
      name = i18n('ticket.list.overdue.status2', '逾期已恢复')
      color = '#FFCD3D'
      break
    default:
      break
  }
  return { name, color }
}

export function getOlaOverdueName(status) {
  return getOlaOverdueInfo(status).name
}

export function getSlaStatusName(status) {
  switch (status) {
    case 0:
      return '进行中'
    case 1:
      return '正常结束'
    case 2:
      return '非正常结束'
    default:
      return ''
  }
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
