// 工单状态的名称和颜色
export const getStatus = text => {
  let name = ''
  let color = ''
  switch (text) {
    case 2:
      name = '处理中'
      color = '#1F99E5'
      break // 处理中
    case 3:
      name = '已完成'
      color = '#3CD768'
      break // 已完成
    case 7:
      name = '已关闭'
      color = '#B8BEC8'
      break // 已关闭
    case 10:
      name = '挂起'
      color = '#FF4848'
      break // 挂起
    case 11:
      name = '已废除'
      color = '#ec4e53'
      break // 已废除
    case 12:
      name = '已处理'
      color = '#0549c5'
      break // 已处理
    case 13:
      name = '已归档'
      color = '#0549c5'
      break // 已归档
    default:
      name = '待处理'
      color = '#FFCD3D'
      break // 待处理
  }
  return { name, color }
}

// 服务端返回的协同工单值有children字段，需要特殊处理
export const flatTicketList = list => {
  return list.reduce((arr, item) => {
    if (item.children) {
      return [...arr, ...item.children]
    } else {
      return [...arr, item]
    }
  }, [])
}
