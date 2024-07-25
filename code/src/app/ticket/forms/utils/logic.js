import moment from 'moment'
import { stringify } from './stringify'

// 获取下拉字段的初始值
function getInitialValueOfListSel(field) {
  const { defaultValue, tabStatus, params } = field

  if (!defaultValue) {
    return undefined
  }

  if (tabStatus === '0') {
    if (Array.isArray(defaultValue)) {
      return defaultValue.map((item) => item + '')
    } else {
      return defaultValue + ''
    }
  } else {
    if (Array.isArray(defaultValue)) {
      return defaultValue
        .map((item) => {
          if (typeof item === 'object') {
            return item
          }
          return params.find((p) => p.value === item + '')
        })
        .filter(Boolean)
    } else if (typeof defaultValue === 'object') {
      return defaultValue
    } else {
      return params.find((p) => p.value === defaultValue + '')
    }
  }
}

// 获取时间字段的初始值
function getInitialValueOfDetetime(field) {
  const { defaultValue } = field

  if (Number(defaultValue) === 2) {
    return undefined
  }
  if (Number(defaultValue) === 1) {
    return moment()
  }
  return Object.is(NaN, Number(defaultValue)) ? moment(defaultValue) : moment(Number(defaultValue))
}

// 获取表格字段的初始值
function getInitialValueOfTable(field) {
  const { defaultValue } = field
  let initialTableValue

  try {
    initialTableValue = defaultValue
      ? typeof defaultValue === 'string'
        ? JSON.parse(defaultValue)
        : defaultValue
      : []
  } catch (e) {
    initialTableValue = undefined
  }

  return initialTableValue
}

// 获取链接字段的初始值
function getInitialValueOfLink(field) {
  const { linkName, linkUrl, linkProtocol } = field

  if (linkName || linkUrl || linkProtocol) {
    return { linkName, linkUrl, linkProtocol }
  }
  return undefined
}

function getInitialValueOfLayer(field) {
  const { defaultValue, resParams } = field
  const defaultOptions = []
  for (const key in resParams) {
    for (const item of resParams[key]) {
      if (item.select) {
        defaultOptions.push(item.value)
      }
    }
  }

  return defaultValue && defaultValue.length > 0
    ? `${defaultValue}`
    : defaultOptions.length > 0
    ? `${defaultOptions[0]}`
    : null
}

/**
 * 获取表单中字段的初始值
 * 大多数直接取field.defaultValue
 * @param {object} field 字段
 */
export function getInitialValueOfField(field) {
  const { type, defaultValue } = field

  switch (type) {
    case 'singleRowText':
    case 'multiRowText':
    case 'flowNo':
      return typeof defaultValue === 'string' || !defaultValue
        ? defaultValue
        : stringify(defaultValue)
    case 'listSel':
    case 'business':
      return getInitialValueOfListSel(field)
    case 'singleSel':
      return typeof defaultValue === 'number' ? defaultValue + '' : defaultValue
    case 'cascader':
      return field.directoryFullPath && defaultValue
        ? { label: field.directoryFullPath[defaultValue.value], value: defaultValue.value }
        : defaultValue
    case 'layer':
      return getInitialValueOfLayer(field)
    case 'int':
    case 'double':
      return typeof defaultValue === 'number' ? defaultValue : undefined
    case 'dateTime':
      return getInitialValueOfDetetime(field)
    case 'table':
      return getInitialValueOfTable(field)
    case 'user':
    case 'department':
    case 'userGroup':
      if (defaultValue === '*********') {
        return defaultValue
      }
      return typeof defaultValue === 'string'
        ? defaultValue && defaultValue.includes('#不支持导出的类型#')
          ? undefined
          : JSON.parse(defaultValue)
        : defaultValue
        ? defaultValue.filter(Boolean)
        : undefined
    case 'securityCode':
      return undefined
    case 'timeInterval':
      if (defaultValue === '*********') {
        return defaultValue
      }
      return typeof defaultValue === 'string' ? JSON.parse(defaultValue) : defaultValue || {}
    case 'excelImport':
      return defaultValue || []
    case 'links':
      return getInitialValueOfLink(field)
    case 'multiSel':
    case 'richText':
    case 'attachfile':
    case 'resource':
    case 'treeSel':
    case 'topology':
    case 'customizeTable':
    case 'job':
    case 'tags':
    case 'nodeExecution':
    case 'permission':
    case 'jsontext':
    default:
      return defaultValue || undefined
  }
}

// 判断表单里是否有 关联自动化任务 组件
export function hasRelateJob(formLayoutVos) {
  formLayoutVos = formLayoutVos || []
  // 1. 控件的形式展示
  let itemRelateJob = formLayoutVos.find((item) => item.type === 'relate_job')
  if (itemRelateJob) {
    return itemRelateJob
  }
  // 2. 字段的形式展示
  let fieldList = []
  formLayoutVos.forEach((item) => {
    fieldList = fieldList.concat(item?.fieldList || [])
  })
  itemRelateJob = fieldList.find((item) => item.type === 'relate_job')
  if (itemRelateJob) {
    return itemRelateJob
  }
  // 3. tab的形式展示
  let tabs = []
  let tabsFieldList = []
  formLayoutVos.forEach((item) => {
    if (item.type === 'tab') {
      tabs = tabs.concat(item?.tabs || [])
    }
  })
  tabs.forEach((item) => {
    tabsFieldList = tabsFieldList.concat(item?.fieldList || [])
  })
  itemRelateJob = tabsFieldList.find((item) => item.type === 'relate_job')
  if (itemRelateJob) {
    return itemRelateJob
  }
  // 无关联自动化任务，返回false
  return false
}

export function planExecuteStep(formLayoutVos) {
  const itemRelate = hasRelateJob(formLayoutVos)
  let step = 0
  if (itemRelate) {
    const executeStep = itemRelate?.fieldList?.find((item) => item.type === 'job_execute_step')
    if (executeStep) {
      step = executeStep?.defaultValue
    }
  }
  return step
}

export function getPlanDetailData(formLayoutVos) {
  const itemRelate = hasRelateJob(formLayoutVos)
  let data = {}
  if (itemRelate) {
    const planData = itemRelate?.fieldList?.find((item) => item.type === 'execute_plan_data')
    if (planData) {
      data = planData?.defaultValue
    }
  }
  return data
}

export function getIsHideRelateJob() {
  const relateJobElement = document.getElementById('relate_job')
  if (relateJobElement) {
    const computedStyle = window.getComputedStyle(relateJobElement)
    return computedStyle.display === 'none'
  }
  return false
}
