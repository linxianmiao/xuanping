import { matchReg } from '~/ticket/forms/utils/stringify'
import { toJS } from 'mobx'

// 从scriptfunc.js拿来的方法
export function stringArrayContain(compare, compared) {
  const mergeData = [].concat(compare, compared)
  return mergeData.length !== new Set(mergeData).size
}
// 从scriptfunc.js拿来的方法
export function match(curVal, Linkage, type) {
  switch (type) {
    case 'EQUALS':
      return _.isEqual(curVal, Linkage)
    case 'NOTEQUALS':
      return !_.isEqual(curVal, Linkage)
    case 'CONTAINS':
      return typeof Linkage === 'string'
        ? (curVal || '').indexOf(Linkage) !== -1
        : stringArrayContain(curVal, Linkage)
    case 'NOTCONTAINS':
      return typeof Linkage === 'string'
        ? (curVal || '').indexOf(Linkage) === -1
        : !stringArrayContain(curVal, Linkage)
    case 'EMPTY':
      return _.isEmpty(curVal)
    case 'NOTEMPTY':
      return !_.isEmpty(curVal)
    // case 'LT': return Number(curVal) < Number(Linkage)
    // case 'GT': return Number(curVal) > Number(Linkage)
  }
}

/**
 * 从关联规则中找出隐藏关联，并调整格式
 */
export function parseHideRules(tableRules) {
  const rules = []

  if (!tableRules || tableRules.length === 0) {
    return rules
  }

  tableRules
    .filter((item) => item.type === 'hide')
    .forEach((item) => {
      item.hideRules.forEach((rule) => {
        rules.push({
          ...rule,
          observableCell: item.observableCell
        })
      })
    })

  return rules
}

/**
 * 是否匹配到隐藏关联
 */
export function isMatchHideRule(column, record, parsedHideRules, fields, columns) {
  const isMatch = parsedHideRules
    .filter((item) => item.observerCell === column.value)
    .some((item) => {
      return item.conditions.every((cond) => {
        const { observableCell } = item
        const { observableCellExpandCode, condition, value } = cond
        const observableColumn = columns.find((col) => col.value === observableCell)
        const field = _.find(fields, (data) => data.code === observableColumn.source) || {}

        const param =
          _.find(field.params, (data) => data.value === _.get(record, `${observableCell}.value`)) ||
          {}
        const observableCellExpandValue =
          observableCellExpandCode === '_value'
            ? field.tabStatus === '1' && record[observableCell]
              ? record[observableCell].value
              : record[observableCell]
            : _.get(param, `listSelExpand.${observableCellExpandCode}`)

        return match(value, observableCellExpandValue, condition)
      })
    })

  return isMatch
}

export function isEmpty(data, field) {
  switch (typeof data) {
    case 'string':
      if (field.type === 'dateTime') {
        return ['1', '2'].includes(data) || !data
      }
      return !data
    case 'undefined':
      return true
    case 'number':
      return !String(data)
    case 'object':
      if (data === null) {
        return true
      } else if (data instanceof Array) {
        // 级联字段是数组
        return !data.length
      } else if (data._isAMomentObject) {
        return false
      } else if (field.type === 'links') {
        return !data.linkUrl
      } else if (field.type === 'listSel' && field.tabStatus === '1') {
        return !data.value
      }
    default:
      return false
  }
}

// 校验表格中的单元格
// 1.必填
export function validator(value, column, field = {}) {
  if (isEmpty(toJS(value), field) && column.isRequired === 1) {
    return '不能为空'
  }
  if (column.type === 'singleRowText') {
    const realValue = _.trim(value || '')
    if (realValue.length > (field.maxLength || Infinity)) {
      return `${i18n('ticket.forms.beyond', '不能超出')}${field.maxLength}${i18n(
        'ticket.forms.character',
        '字符'
      )}`
    }
    if (realValue.length < (field.minLength || 0)) {
      return `${i18n('ticket.forms.below', '不能低于')}${field.minLength}${i18n(
        'ticket.forms.character',
        '字符'
      )}`
    }
    if (!isEmpty(toJS(value), field)) {
      const { match, message } = matchReg(realValue, field.validation, field.reg)
      if (!match) {
        return message
      }
    }
  }
  return false
}
