/**
 * 解析下拉字段初始值
 * 自定义选项的下拉字段的defaultValue可能是id/[id]
 * 外部数据源的下拉字段的defaultValue可能是id/[id]/{id, name}/[{id, name}]
 * 
 * 兼容垃圾数据，params的value有的是number有的是string，导致defaultValue有可能是string ， number ， array 三种类型
 */
export function getInitialValue(value, field) {
  if (!value) {
    return undefined
  }

  const { tabStatus, params } = field

  if (tabStatus === '0') {
    if (Array.isArray(value)) {
      return value.map(item => item + '')
    } else {
      return value + ''
    }
  } else {
    if (Array.isArray(value)) {
      return value
        .map(item => {
          if (typeof item === 'object') {
            return item
          }
          return params.find(p => p.value === item + '')
        })
        .filter(item => !!item)

    } else if (typeof value === 'object') {
      return value
    } else {
      return params.find(p => p.value === value + '')
    }
  }
}
