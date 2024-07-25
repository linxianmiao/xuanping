import moment from 'moment'

function momentArrayToStringArray(times) {
  const format = 'YYYY-MM-DD HH:mm:ss'
  if (_.isEmpty(times)) {
    return []
  }
  if (_.isString(times)) {
    return [times]
  }
  if (['CurrentDay', 'CurrentWeek', 'CurrentMonth'].includes(_.head(times))) {
    return times
  }
  return [
    moment(times[0]).startOf('day').format(format),
    moment(times[1]).endOf('day').format(format)
  ]
}

export function detailTime(query, allField) {
  let list = []
  if (_.isArray(allField)) {
    list = allField
  } else {
    const { builtinFields, extendedFields } = allField || {
      builtinFields: [],
      extendedFields: []
    }
    list = [...builtinFields, ...extendedFields]
  }
  const timeList = [
    'create_time',
    'update_time',
    ..._.chain(list).filter(item => item.type === 'dateTime').map(item => item.code).value()
  ]
  const timeObj = _.reduce(timeList, (sum, item) => {
    if (_.has(query, item)) {
      const time = momentArrayToStringArray(query[item])
      return { ...sum, [item]: time }
    }
    return sum
  }, {})
  return _.assign({}, query, timeObj)
}

// 用来给mobx里的store设置属性
export const setProps = context => obj => {
  const keys = Object.keys(obj)
  if (!keys.length) return
  keys.forEach(key => {
    if (key in context) {
      context[key] = obj[key]
    }
  })
}

export function flatTicketList(ticketList) {
  return ticketList.reduce((arr, item) => {
    if (item.children) {
      return [...arr, ...item.children]
    } else {
      return [...arr, item]
    }
  }, [])
}

export const addUrlParams = (url, params) => {
  const keys = Object.keys(params)

  if (keys.length === 0) return url

  const paramStr = keys
    .filter(key => params[key] !== undefined)
    .map(key => `${key}=${params[key]}`)
    .join('&')

  return `${url}${url.includes('?') ? '' : '?'}${paramStr}`
}

export function isNotEmptyArray(arr) {
  return Array.isArray(arr) && arr.length > 0
}

export function isJSON(data) {
  try {
    if (typeof JSON.parse(data) === 'object') {
      return true
    }
  } catch (e) {
    // console.log(e)
    return false
  }
  return false
}

// 解析数组字段类型的数据为数组
export function parseTagsDataToArray(data) {
  if (!data) {
    return []
  }
  if (Array.isArray(data)) {
    return data
  }
  if (isJSON(data)) {
    return JSON.parse(data)
  }
  return []
}
