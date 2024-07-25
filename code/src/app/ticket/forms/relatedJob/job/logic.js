/**
 * 1: 创建定时作业
 * 2: 创建执行计划
 * 3: 停用定时作业
 */
export const ACTION_TYPE_LIST = ['1', '2', '3']

export const IFRAME_URL_INFO = {
  'plan-list': {
    params: {
      selectable: true
    },
    postMessageType: 'itsm.plan.select',
    resMessageType: 'automation.plan.select'
  },
  'plan-create': {
    params: {},
    postMessageType: 'itsm.plan.save',
    resMessageType: 'automation.plan.save'
  },
  'plan-edit': {
    params: {},
    postMessageType: 'itsm.plan.save',
    resMessageType: 'automation.plan.save'
  },
  'plan-detail': {
    params: {},
    postMessageType: '',
    resMessageType: ''
  },
  'plan-job': {
    params: {},
    postMessageType: '',
    resMessageType: ''
  },
  'timer-list': {
    params: {
      selectable: true,
      status: 3
    },
    postMessageType: ['itsm.timer.select', 'itsm.timer.selected'],
    resMessageType: 'automation.timer.selected'
  },
  'timer-create': {
    params: {},
    postMessageType: 'itsm.timer.save',
    resMessageType: 'automation.timer.save'
  },
  'timer-edit': {
    params: {},
    postMessageType: 'itsm.timer.save',
    resMessageType: 'automation.timer.save'
  },
  'timer-detail': {
    params: {},
    postMessageType: '',
    resMessageType: ''
  },
  'timer-job': {
    params: {
      redirectType: 'inner'
    },
    postMessageType: '',
    resMessageType: 'automation.job.detail'
  }
}

export function getUrl(iframeType, extraParams = {}) {
  if (!iframeType) {
    return ''
  }

  let url = `/automation/#/iframe/job/factory?product=itsm&type=${iframeType}`
  const params = { ...IFRAME_URL_INFO[iframeType].params, ...extraParams }

  Object.keys(params).forEach(key => {
    if (!!String(params[key])) {
      url += `&${key}=${params[key]}`
    }
  })

  return url
}

export function getPostMessageType(iframeType, index) {
  const { postMessageType } = IFRAME_URL_INFO[iframeType]
  
  if (Array.isArray(postMessageType)) {
    return postMessageType[index || 0]
  }
  return postMessageType
}

export function getResMessageType(iframeType) {
  return IFRAME_URL_INFO[iframeType].resMessageType
}
