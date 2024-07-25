import React from 'react'
import { toJS } from 'mobx'

const IFRAME = 'iframe'
const SUBFORM = 'subForm'
const SLA = 'sla'
const TAB = 'tab'
const GROUP = 'group'
const PLACEHOLDER = 'placeholder'
const RELATE_TICKET = 'relateTicket'

// Iframe控件控件后端所需的keys
const IFRAME_KEY = [
  'id',
  'height',
  'linkUrl',
  'mode',
  'name',
  'type',
  'verificationWay',
  'viewEditVo',
  'styleAttribute',
  'fold',
  'ifPrivacy'
]
// SLA控件控件后端所需的keys
const SLA_KEY = ['id', 'height', 'name', 'type', 'styleAttribute', 'fold', 'version']
// 子表单控件后端所需的keys
const SUBFORM_KEY = ['id', 'name', 'type', 'relatedTemplateId', 'hidden', 'mode', 'relatedVariable']
// 关联工单组件后端所需的keys
const RELATE_TICKET_KEY = [
  'id',
  'height',
  'name',
  'type',
  'styleAttribute',
  'fold',
  'isRequired',
  'version',
  'relateModels',
  'createRelatedTicket',
  'relateModelsScope'
]

/**
 * 校验Iframe控件的信息
 * @param {Object} iframeData iframe控件的信息
 */
function validateIframe(iframeData) {
  const { name, linkUrl, height, viewEditVo, mode } = iframeData
  if (_.isEmpty(name) || !height) {
    return true
  }
  if (mode === 0 && _.isEmpty(linkUrl)) {
    return true
  }
  if (mode === 1) {
    const { viewUrl, editUrl } = viewEditVo
    if (_.isEmpty(viewUrl) || _.isEmpty(editUrl)) {
      return true
    }
  }
  return false
}
/**
 * 校验SLA控件的信息
 * @param {Object} slaData  //SLA控件的信息
 */
function validateSla(slaData) {
  const { name, height } = slaData
  if (_.isEmpty(name) || height === undefined) {
    return true
  }
  return false
}

// 校验纵向分组标题信息
function validateGroup(groupsidedata) {
  const { name } = groupsidedata
  if (_.isEmpty(name)) {
    return true
  }
  return false
}

function validateRelateSubProcess(field) {
  const { name, taskModelIds, commonColumnList } = field
  if (_.isEmpty(name) || _.isEmpty(toJS(taskModelIds)) || _.isEmpty(toJS(commonColumnList))) {
    return true
  }
  return false
}

function validateSubForm(subForm) {
  const { name, mode, relatedTemplateId, relatedVariable } = subForm
  if (_.isEmpty(name)) return true
  if (mode === 1 && _.isEmpty(relatedVariable)) return true
  if (mode === 0 && _.isEmpty(relatedTemplateId)) return true
  return false
}

// 获取后端所需的formLayout
function getFormLayout(formLayout) {
  switch (formLayout.type) {
    case SUBFORM:
      return _.pick(formLayout, SUBFORM_KEY)
    case IFRAME:
      return _.pick(formLayout, IFRAME_KEY)
    case SLA:
      return _.pick(formLayout, SLA_KEY)
    case RELATE_TICKET:
      return _.pick(formLayout, RELATE_TICKET_KEY)
    default:
      return formLayout
  }
}
// 获取formLayoutVos，对控件部分进行处理
export function getFormLayoutVos(formLayoutVos) {
  const vos = _.map(formLayoutVos, (formLayout) => {
    const { type, fieldList, tabs } = formLayout
    if (type === GROUP) {
      const fields = _.map(fieldList, (field) => getFormLayout(field))
      return { ...formLayout, fieldList: fields }
    } else if (type === TAB) {
      return {
        ...formLayout,
        tabs: _.map(tabs, (tab) => ({
          ...tab,
          fieldList: _.map(tab.fieldList, (field) => getFormLayout(field))
        }))
      }
    } else {
      return getFormLayout(formLayout)
    }
  })
  return vos
}

// 获取和校验formLayoutVos，如果校验通过则返回字段列表（注意：字段列表不包含控件）
export function getAndvalidateFields(formLayoutVos) {
  return new Promise((resolve, reject) => {
    let fields = []
    let groups = []

    _.forEach(formLayoutVos, (formLayout) => {
      const { type, fieldList, tabs } = formLayout
      if (type === GROUP) {
        fields = [...fields, ...fieldList]
        groups.push(formLayout)
      } else if (type === TAB) {
        _.forEach(tabs, (tab) => {
          fields = [...fields, ...tab.fieldList]
        })
      } else {
        fields.push(formLayout)
      }
    })

    const iframeList = _.filter(fields, (field) => field.type === IFRAME)
    const slaList = _.filter(fields, (field) => field.type === SLA)
    const subFormList = _.filter(fields, (field) => field.type === SUBFORM)
    const relateSubProcessList = _.filter(fields, (field) => field.type === 'relateSubProcess')

    if (_.some(subFormList, (subForm) => validateSubForm(subForm))) {
      reject(new Error('subForm'))
    }
    if (_.some(iframeList, (iframe) => validateIframe(iframe))) {
      reject(new Error('iframe'))
    }
    if (_.some(slaList, (sla) => validateSla(sla))) {
      reject(new Error('sla'))
    }
    if (_.some(groups, (group) => validateGroup(group))) {
      reject(new Error('group'))
    }
    if (_.some(relateSubProcessList, (field) => validateRelateSubProcess(field))) {
      reject(new Error('relateSubProcess'))
    }
    // 过滤掉不是字段的数据
    fields = _.filter(
      fields,
      (field) => !_.includes([IFRAME, SUBFORM, PLACEHOLDER, SLA, RELATE_TICKET], field.type)
    )
    resolve(fields)
  })
}
