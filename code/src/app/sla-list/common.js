export function renderPriority(priority) {
  switch (priority) {
    case 1: return i18n('globe.low', '低')
    case 2: return i18n('table.normal', '普通')
    case 3: return i18n('table.medium', '中等')
    case 4: return i18n('globe.important', '重要')
    case 5: return i18n('globe.urgent', '紧急')
    default: return ''
  }
}

export function renderUnit(unit) {
  switch (unit) {
    case 'SECONDS': return i18n('globe.seconds', '秒')
    case 'MINUTES': return i18n('minute', '分')
    case 'HOURS': return i18n('hours', '小时')
    case 'DAYS': return i18n('day', '天')
    default: return ''
  }
}

export function renderPriorityColor(priority) {
  switch (priority) {
    case 1: return '#5be570'
    case 2: return '#52edcb'
    case 3: return '#fadc23'
    case 4: return '#ffae2f'
    case 5: return '#ff522a'
    default: return ''
  }
}

export function renderPrioritytype(priority) {
  switch (priority) {
    case 1: return 'recover'
    case 2: return 'primary'
    case 3: return 'warning'
    case 4: return 'serious'
    case 5: return 'danger'
    default: return ''
  }
}
