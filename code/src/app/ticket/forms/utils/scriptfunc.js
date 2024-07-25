import React from 'react'
import moment from 'moment'
import { message, Modal } from '@uyun/components'
import _ from 'lodash'

function stringArrayContain(compare, compared) {
  const mergeData = []
    .concat(compare, compared)
    .map((item) => (typeof item === 'number' ? item + '' : item)) // 有些字段的选项值类型数字和字符串搞混了
  return mergeData.length !== new Set(mergeData).size
}

function equal(compare, compared, timeGranularity) {
  if (moment.isMoment(compare)) {
    const strTimeGranularity =
      timeGranularity === 2
        ? 'date'
        : timeGranularity === 3
        ? 'minutes'
        : timeGranularity === 4
        ? 'seconds'
        : 'month'
    return compare.isSame(moment(+compared), strTimeGranularity)
  }

  let formatCompare = compare
  if (!Array.isArray(compared) && Array.isArray(compare)) {
    formatCompare = compare[0]
  }
  let formatCompared = compared
  // compare是字符串，compared是数组的情况下，比较不生效，需要取数组里的值进行比较
  if (!Array.isArray(compare) && Array.isArray(compared)) {
    formatCompared = compared[0]
  }
  // 有些字段的选项值类型数字和字符串搞混了
  // 这里将数字类型的转成字符串，再进行isEqual比较
  const a = typeof formatCompare === 'number' ? `${formatCompare}` : formatCompare
  const b = typeof formatCompared === 'number' ? `${formatCompared}` : formatCompared

  return _.isEqual(a, b)
}

function isTimestamp(str) {
  try {
    const timestamp = parseInt(str)
    const date = new Date(timestamp * 1000)
    return date.getTime() === timestamp * 1000
  } catch {
    return false
  }
}

function timeComparison(compare, compared, type, timeGranularity) {
  let time = compare
  if (moment.isMoment(compare)) {
    const strTimeGranularity =
      timeGranularity === 2
        ? 'YYYY-MM-DD'
        : timeGranularity === 3
        ? 'YYYY-MM-DD HH:mm'
        : timeGranularity === 4
        ? 'YYYY-MM-DD HH:mm:ss'
        : 'YYYY-MM'
    time = new Date(moment(time).format(strTimeGranularity)).valueOf()
    let currentTime = new Date(moment().format(strTimeGranularity)).valueOf() // 当前时间
    if (type === 'EARLIERTHANNOW') {
      currentTime = currentTime - +compared
      if (time === 0) return false
      return time < currentTime
    } else if (type === 'LATERTHANNOW') {
      if (time === 0) return false
      currentTime = currentTime + +compared
      return time > currentTime
    } else if (type === 'LT') {
      if (time === 0) return false
      if (isTimestamp(compared)) {
        const Compared = new Date(moment(+compared).format(strTimeGranularity)).valueOf()
        return time < Compared
      }
    } else if (type === 'GT') {
      if (time === 0) return false
      if (isTimestamp(compared)) {
        const Compared = new Date(moment(+compared).format(strTimeGranularity)).valueOf()
        return time > Compared
      }
    }
  }
}

/**
 * 对字段脚本进行判断，看看是否可以执行
 * @param {*} curVal  当前值
 * @param {*} Linkage  策略中得值
 * @param {*} type  条件
 */
export function Judge(curVal, Linkage, type, timeGranularity) {
  if (type === 'EMPTY' && typeof curVal === 'number') {
    curVal = String(curVal)
  }
  switch (type) {
    case 'EQUALS':
      return equal(curVal, Linkage, timeGranularity)
    case 'NOTEQUALS':
      return !equal(curVal, Linkage, timeGranularity)
    case 'CONTAINS':
      // 以下针对级联的特殊处理
      if (Array.isArray(curVal) && Array.isArray(Linkage) && Array.isArray(Linkage[0])) {
        return _.some(Linkage, (d) => _.isEqual(d, curVal))
      }
      // 针对下拉字典多选的特殊处理
      if (
        Array.isArray(curVal) &&
        Array.isArray(Linkage) &&
        _.has(curVal[0], 'value') &&
        _.has(curVal[0], 'label') &&
        _.has(Linkage[0], 'value') &&
        _.has(Linkage[0], 'label')
      ) {
        const curValCodes = _.map(curVal, (d) => d.value)
        const LinkageCodes = _.map(Linkage, (d) => d.value)
        return _.some(LinkageCodes, (d) => curValCodes.includes(d))
      }
      return typeof Linkage === 'string'
        ? (curVal || '').indexOf(Linkage) !== -1
        : stringArrayContain(curVal, Linkage)
    case 'NOTCONTAINS':
      if (Array.isArray(curVal) && Array.isArray(Linkage) && Array.isArray(Linkage[0])) {
        return !_.some(Linkage, (d) => _.isEqual(d, curVal))
      }
      // 针对下拉字典多选的特殊处理
      if (
        Array.isArray(curVal) &&
        Array.isArray(Linkage) &&
        _.has(curVal[0], 'value') &&
        _.has(curVal[0], 'label') &&
        _.has(Linkage[0], 'value') &&
        _.has(Linkage[0], 'label')
      ) {
        const curValCodes = _.map(curVal, (d) => d.value)
        const LinkageCodes = _.map(Linkage, (d) => d.value)
        return !_.some(LinkageCodes, (d) => curValCodes.includes(d))
      }
      return typeof Linkage === 'string'
        ? (curVal || '').indexOf(Linkage) === -1
        : !stringArrayContain(curVal, Linkage)
    case 'EMPTY':
      return _.isEmpty(curVal)
    case 'NOTEMPTY':
      return !_.isEmpty(curVal)
    case 'LT':
      return moment.isMoment(curVal)
        ? timeComparison(curVal, Linkage, type, timeGranularity)
        : Number(curVal) < Number(Linkage)
    case 'GT':
      return moment.isMoment(curVal)
        ? timeComparison(curVal, Linkage, type, timeGranularity)
        : Number(curVal) > Number(Linkage)
    case 'EARLIERTHANNOW': // 早于当前时间
      return timeComparison(curVal, Linkage, type, timeGranularity)
    case 'LATERTHANNOW': // 晚于当前时间
      return timeComparison(curVal, Linkage, type, timeGranularity)
  }
}
// 执行联动策略脚本
/**
 *
 * @param {Object} 策略的动作：修改字段的值，属性，或者脚本
 * @param {Object} field 要被修改的字段的值
 * @param {*} form form表单对象
 * @param {*} callback //回调，用于修改字段的值等行为
 * @param {Object} props //给动态脚本使用得数据
 */
export function setVal(content, field, form, callback, props) {
  const { setFieldsValue, getFieldValue, setFields } = form // 闭包给动态脚本使用得函数
  const { type, value, empty } = content
  if (type === 'visible') {
    // 可见性
    callback([
      {
        code: field.code,
        hidden: value === '0'
      }
    ])
  }
  if (type === 'checkIn') {
    // 基础校验
    callback([
      {
        code: field.code,
        isRequired: +value
      }
    ])
  }
  if (type === 'changeValue') {
    // 值改变
    callback([
      {
        code: field.code,
        value: empty === 1 ? undefined : value
      }
    ])
  }
  if (type === 'asyncValue') {
    // 脚本
    const fn = eval(`(${value})`)
    try {
      const callbackFn = (value, type = 'value') => {
        if (value === undefined) {
          callback([])
          return false
        }
        if (type === 'value') {
          callback([
            {
              code: field.code,
              value: field.type === 'dateTime' ? moment(value) : value
            }
          ])
        } else if (type === 'complete') {
          callback([
            {
              code: field.code,
              params: value
            }
          ])
        } else if (type === 'params') {
          // 设置字段选项值
          callback([
            {
              code: field.code,
              params: _.filter(field.params, (item) => _.includes(value, `${item.value}`))
            }
          ])
        }
      }
      fn(callbackFn, props)
    } catch (e) {
      message.error('脚本执行出现错误')
    }
  }
  if (type === 'timeValidate') {
    // 时间字段校验
    callback([
      {
        code: field.code,
        timeValidate: value
      }
    ])
  }
  return field
}

/**
 * 对字段的联动策略进行汇总处理，并且获取当前表单字段联动策略的总数
 * @param {String} combineCustomScript //表单的脚本
 * @param {Array} subformScript //子表单的脚本
 * @param {Array} formLayoutVos //表单的数据，带有分组信息和字段数据
 * @param {Array} fields //表单字段的列表
 */
export function getState(combineCustomScript, subformScript, formLayoutVos, fields) {
  const scriptLen = {
    init: 0, // 表单字段 初始化脚本的数量
    inited: 0, // 表单字段 已经执行初始化脚本的数量
    all: 0, // 表单字段 所有脚本的数量（包含初始化）
    allEnd: 0 // 表单字段 已经执行所有脚本的数量（包含初始化）
  }
  const changeTriggerData = [] // 字段自身的脚本
  const colList = _.map(fields, (field) => {
    _.forEach(field.linkageStrategyVos, (it) => {
      const { changeContent, initialValue } = it
      it.triggerName = field.code
      changeTriggerData.push(it)
      if (_.isArray(changeContent)) {
        if (initialValue) {
          scriptLen.init = scriptLen.init + changeContent.length
        }
        scriptLen.all = scriptLen.all + changeContent.length
      }
    })
    return field.fieldLayout ? field.fieldLayout.col : field.fieldLine === 2 ? 12 : 24
  })
  //纵向分组的联动策略
  _.forEach(formLayoutVos, (formLayout) => {
    if (formLayout.type === 'group') {
      formLayout.code = formLayout.id
      _.forEach(formLayout.linkageStrategyVos, (it) => {
        const { changeContent, initialValue } = it
        it.triggerName = formLayout.id
        changeTriggerData.push(it)
        if (_.isArray(changeContent)) {
          if (initialValue) {
            scriptLen.init = scriptLen.init + changeContent.length
          }
          scriptLen.all = scriptLen.all + changeContent.length
        }
      })
    }
  })
  // 全局脚本
  let globalScript = {}
  if (combineCustomScript) {
    try {
      globalScript = eval(`(${combineCustomScript})`)
    } catch (e) {
      console.log('全局脚本eval转化失败')
    }
  }

  // 子表单脚本
  const subformScriptArray = []
  _.forEach(subformScript, (item) => {
    try {
      subformScriptArray.push(eval(`(${item})`))
    } catch (e) {
      console.log('子表单脚本eval转化失败')
    }
  })
  //找出哪些字段加了onrowok的脚本以确定是否显示每行的确定按钮
  const tableCodes = _.chain(fields)
    .filter((d) => d.type === 'table')
    .map((d) => d.code)
    .value()
  let showOkTables = []
  tableCodes.forEach((code) => {
    // 是否是子表单的字段
    const itemScript =
      subformScriptArray && subformScriptArray.find((itm) => itm[`${code}_onrowok`])
    if (globalScript[`${code}_onrowok`]) {
      showOkTables.push(code)
    } else if (itemScript) {
      showOkTables.push(code)
    }
  })
  return {
    scriptLen,
    formLayoutVos,
    changeTriggerData,
    fieldMinCol: Math.min(...colList),
    combineCustomScript: globalScript || {},
    subformScript: subformScriptArray || [],
    showOkTables
  }
}

/**
 * 获取fieldList列表中符合条件的字段编码
 * @param {Array} fields   字段列表
 * @param {Array} types   为字段的类型列表 field.type  当且仅当 第三个参实为type时有用
 * @param {String} type   type | hidden    字段类型  | 字段是否隐藏的属性
 */
export function getFieldsCode(fields, types, type) {
  return _.chain(fields)
    .filter((field) => {
      if (type === 'code') {
        return _.includes(types, field.type) && field.isRequired !== 2
      }
      if (type === 'hidden') {
        return !field.hidden && field.isRequired !== 2
      }
      return false
    })
    .map((field) => field.code)
    .value()
}

/**
 * 过滤出符合条件的字段code
 * @param {Array} formLayoutVos
 * @param {Array} codeTypes 需要过滤的字段类型
 * @param {string} type hidden 当前没有被隐藏的code ，code 根据codeTypes过滤出字段类型属于codeTypes的code
 */

export function getFormLayoutVosCode(formLayoutVos, types, type = 'code') {
  const codes = _.map(formLayoutVos, (formLayout) => {
    if (type === 'hidden' && formLayout.hidden) {
      return []
    }
    if (formLayout.type === 'group' || formLayout.type === 'panel') {
      return getFieldsCode(formLayout.fieldList, types, type)
    } else {
      return _.map(formLayout.tabs, (tab) => {
        if (type === 'hidden' && tab.hidden) {
          return []
        }
        return getFieldsCode(tab.fieldList, types, type)
      })
    }
  })
  return _.chain(codes).flattenDeep().compact().value()
}
// 目前可以设置的属性
const attributeList = [
  'isRequired',
  'params',
  'hidden',
  'iframeSrc',
  'name',
  'timeScope',
  'attributeList',
  'customAttribute',
  'actionType', // 关联作业动作
  'isChangeOutsideParams', // 全局脚步配置是否可修改外部下拉的params
  'isChangeDictionaryParams'
]

/**
 * 根据list对字段的某些属性进行修改
 * @param {Array} fieldList
 * @param {Array} list
 */
function setFields(fieldList, list) {
  _.forEach(fieldList, (field) => {
    // fieldList 包含 iframe控件 ，该控件没有code仅id ，但是字段是以code来区分的
    let fieldCallbackItems = []
    fieldCallbackItems =
      _.filter(list, (item) => item.code === field.code || item.code === field.id) || []
    if (fieldCallbackItems.length > 0) {
      fieldCallbackItems.forEach((fieldCallbackItem) => {
        // 级联和树字段进行特殊处理
        if (field.type === 'treeSel' && _.has(fieldCallbackItem, 'params')) {
          field.treeVos = _.get(fieldCallbackItem, 'params')
        }
        if (field.type === 'cascader' && _.has(fieldCallbackItem, 'params')) {
          field.cascade = _.get(fieldCallbackItem, 'params')
        }
        _.assign(field, _.pick(fieldCallbackItem, attributeList))
      })
    }
  })
}

/**
 * 根据list对表单中的某些属性进行修改
 * @param {Array} formLayoutVos
 * @param {Array} list
 */
export function setformLayoutVosField(formLayoutVos, list) {
  _.forEach(formLayoutVos, (formLayout) => {
    // 查找有没有布局脚本的返回
    const layoutCallbackItem = _.find(list, (item) => {
      if (formLayout.subFormId) {
        return formLayout.subFormId === item.code
      } else {
        return item.code === formLayout.id
      }
    })
    // 处理布局脚本显示隐藏
    formLayout.hidden = _.has(layoutCallbackItem, 'hidden')
      ? _.get(layoutCallbackItem, 'hidden')
      : formLayout.hidden
    // 修改Iframe的src
    formLayout.iframeSrc = _.has(layoutCallbackItem, 'iframeSrc')
      ? _.get(layoutCallbackItem, 'iframeSrc')
      : formLayout.iframeSrc

    // group
    if (formLayout.type === 'group') {
      setFields(formLayout.fieldList, list)
    }

    //panel面板
    if (formLayout.type === 'panel') {
      setFields(formLayout.fieldList, list)
    }
    // tabs
    if (formLayout.type === 'tab') {
      _.forEach(formLayout.tabs, (tab) => {
        // 处理标签页上的脚本的显示隐藏
        const tabCallbackItem = _.find(list, (item) => item.code === tab.id)
        tab.hidden = _.has(tabCallbackItem, 'hidden')
          ? _.get(tabCallbackItem, 'hidden')
          : tab.hidden
        setFields(tab.fieldList, list)
      })
    }
  })
}

/**
 * 工单发请求的时候执行的一次脚本操作
 * @param {Object} forms  整个工单的数据（后端返回）
 * @param {Object} commentData  当前表单提交的内容
 * @param {String} type 当前的动作
 */
export async function realSubmit(forms, commentData, type) {
  return new Promise((resolve, reject) => {
    try {
      const { combineCustomScript, subformScript } = forms
      const onrealsubmitList = []
      let i = 0 // 当前成功执行了几个 onrealsubmit 脚本
      const callback = (type, options = {}) => {
        switch (type) {
          case 'save':
            i++
            break
          case 'cancel':
            if (options.message) {
              message.error(String(options.message))
            }
            reject(new Error('cancel'))
            break
          default:
            reject(new Error('无效的type'))
            break
        }
        if (i === onrealsubmitList.length) {
          resolve()
        }
      }

      // 收集子表单的 onrealsubmit 事件
      _.forEach(subformScript, (item) => {
        const scriptObj = eval(`(${item})`)
        const { onrealsubmit } = scriptObj || {}
        if (onrealsubmit) {
          onrealsubmitList.push(onrealsubmit)
        }
      })

      // 收集主表单的 onrealsubmit 事件
      const globalScript = eval(`(${combineCustomScript})`)
      const { onrealsubmit } = globalScript || {}
      if (onrealsubmit) {
        onrealsubmitList.push(onrealsubmit)
      }

      if (onrealsubmitList.length === 0) {
        resolve()
      } else {
        _.forEach(onrealsubmitList, (onrealsubmit) => {
          const props = { Modal, message, action: type, commentData }
          onrealsubmit(callback, props)
        })
      }
    } catch (e) {
      message.error('onRealSubmit 执行错误')
      reject(e)
    }
  })
}

/**
 * 识别字符串中的http将起转为dom
 * @param {String} text
 */
export function TextRecognitionHttp(text) {
  const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-|#|)+)/g
  if (reg.test(text)) {
    const v = (text || '')
      .replace(reg, "<a target='_blank' href='$&'>$&</a>")
      .replace(/\n/g, '<br />')
    return <div dangerouslySetInnerHTML={{ __html: v || '' }} />
  }
  return text
}

/**
 * 判断布局中是不是有没有通过校验的字段，有的话返回true
 * @param {func} getFieldsError  form组件获取字段error信息函数
 * @param {Array} codes  该布局下拥有的字段code
 */
export function checkFieldsError(fieldsError, type) {
  const fieldErrorCodes = _.chain(fieldsError).omitBy(_.isEmpty).keys().value()
  if (_.isEmpty(fieldErrorCodes)) {
    return false
  }
  if (type === 'scroll') {
    try {
      const firstErrorCode = _.head(fieldErrorCodes)
      const node = document.getElementById(firstErrorCode)
      node && node.scrollIntoView({ block: 'center' })
    } catch (e) {
      console.log(e)
    }
  }
  return true
}

// 与扩展字段进行交互，处理扩展字段返回的错误信息
export function widgetsEventError(setFields, error) {
  let err = {}
  try {
    err = JSON.parse(error.message)
  } catch (e) {
    message.error('自定义字段返回的错误信息不是JSON对象')
  }
  const { fieldCode, fieldName, errorMessage, errorSource, errorMethod } = err || {}

  if (errorSource === 'itsm-field') {
    if (_.includes(errorMethod, 'message')) {
      message.error(`${fieldName} :  ${errorMessage}`)
    }
    if (_.includes(errorMethod, 'field')) {
      setFields({
        [fieldCode]: {
          errors: [new Error(errorMessage)]
        }
      })
    }
  }
}
