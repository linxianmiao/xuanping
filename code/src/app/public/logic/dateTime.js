import moment from 'moment'

/**
 * 时间类型字段，后端返回的值可能是 时间、1、2，这里做下转换
 * @param {*} value 
 * @returns moment
 */
 export function getDateTimeValue(value) {
  if (_.isEmpty(value) || +value === 2) {
    return undefined
  } else {
    if (+value === 1) {
      return moment() // 系统时间
    } else {
      // 处理alert那边带的参数，itsm这里存的是带时区的时间，alert那边传递的是时间戳
      return isNaN(value) ? moment(value) : moment(+value)
    }
  }
}
