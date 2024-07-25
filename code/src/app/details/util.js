// import { Tag } from '@uyun/components'
import { linksToLegal } from '../model/component/flow/utils'

const RECT = 'rect'
const RHOMB = 'rhomb'
const CIRCLE = 'circle'

// 获取当前的提交操作类型
export function getActionType(type) {
  let actionType
  switch (type) {
    case 'create':
      actionType = 1
      break
    case 'submit':
      actionType = 2
      break
    case 'save':
    case 'rollback':
      actionType = 3
      break
    case 'reassign':
      actionType = 4
      break
    case 'delete':
      actionType = 5
      break
    case 'accept':
      actionType = 6
      break
    case 'jump':
      actionType = 7
      break
    case 'cancel':
      actionType = 8
      break
    case 'close':
      actionType = 9
      break
    case 'revoke':
      actionType = 10
      break
    case 'reopen':
      actionType = 11
      break
    case 'update':
      actionType = 14
      break
    default:
      actionType = null
  }
  return actionType
}

export function getActionTypeName(type, actionType, userName) {
  let typeName = ''
  let x = ''
  switch (type) {
    case 'submit':
      typeName = i18n('ticket.conflict.submitFailed', '提交失败,')
      break
    case 'reassign':
      typeName = i18n('ticket.conflict.reassignFailed', '改派失败,')
      break
    case 'jump':
      typeName = i18n('ticket.conflict.jumpFailed', '跳转失败,')
      break
    case 'subprocess':
      typeName = i18n('ticket.conflict.submodelFailed', '创建失败,')
      break
    case 'rollback':
      typeName = i18n('ticket.conflict.rollBackFailed', '回退失败,')
      break
    case 'delete':
      typeName = i18n('ticket.conflict.deleteFailed', '废除失败,')
      break
    case 'close':
      typeName = i18n('ticket.conflict.closeFailed', '关闭失败,')
      break
    case 'reopen':
      typeName = i18n('ticket.conflict.reopenFailed', '重开失败,')
      break
    case 'accept':
      typeName = i18n('ticket.conflict.receiveFailed', '接单失败,')
      break
    case 'save':
      typeName = i18n('ticket.conflict.saveFailed', '保存失败,')
      break
    case 'update':
      typeName = i18n('ticket.conflict.updateFailed', '更新失败,')
      break
    default:
      typeName = ''
  }

  x = getactionTypetoLable(actionType)

  const totalName =
    '' +
    typeName +
    userName +
    i18n('ticket.conflict.already', '已经') +
    x +
    i18n('ticket.conflict.ticket1', '工单')
  return totalName
}
export function getactionTypetoLable(actionType) {
  let x = ''
  switch (actionType) {
    case 1:
      x = i18n('globe.create', '创建')
      break
    case 2:
      x = i18n('globe.submit', '提交')
      break
    case 3:
      x = i18n('globe.rollback', '回退')
      break
    case 4:
      x = i18n('globe.reassign', '改派')
      break
    case 5:
      x = i18n('globe.abolish', '废除')
      break
    case 6:
      x = i18n('globe.accept', '接单')
      break
    case 7:
      x = i18n('globe.jump', '跳转')
      break
    case 8:
      x = i18n('globe.rescind', '撤销')
      break
    case 9:
      x = i18n('globe.close', '关闭')
      break
    case 10:
      x = i18n('globe.revoke', '取回')
      break
    case 11:
      x = i18n('globe.reopen', '重开')
      break
    case 13:
      x = i18n('globe.complete', '完成')
      break
    case 14:
      x = i18n('globe.update', '更新')
      break
  }
  return x
}
var checkBrowser = function () {
  var userAgent = navigator.userAgent // 取得浏览器的userAgent字符串
  var isOpera = userAgent.indexOf('Opera') > -1
  var isIE = -[1]
  if (isOpera) {
    return 'Opera'
  } // 判断是否Opera浏览器
  if (userAgent.indexOf('Firefox') > -1) {
    return 'FF'
  } // 判断是否Firefox浏览器
  if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome'
  }
  if (userAgent.indexOf('Safari') > -1) {
    return 'Safari'
  } // 判断是否Safari浏览器
  if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera) {
    return 'IE'
  } // 判断是否IE浏览器
  if (isIE) {
    return 'IE'
  }
}
export function browser() {
  return checkBrowser()
}

// Emoji校验
export function isEmojiCharacter(substring) {
  if (!substring || typeof substring === 'undefined') {
    return false
  }
  for (var i = 0; i < substring.length; i++) {
    var hs = substring.charCodeAt(i)
    if (hs >= 0xd800 && hs <= 0xdbff) {
      if (substring.length > 1) {
        var ls = substring.charCodeAt(i + 1)
        var uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000
        if (uc >= 0x1d000 && uc <= 0x1f77f) {
          return true
        }
      }
    } else if (substring.length > 1) {
      var lss = substring.charCodeAt(i + 1)
      if (lss === 0x20e3) {
        return true
      }
    } else {
      if (hs >= 0x2100 && hs <= 0x27ff) {
        return true
      } else if (hs >= 0x2b05 && hs <= 0x2b07) {
        return true
      } else if (hs >= 0x2934 && hs <= 0x2935) {
        return true
      } else if (hs >= 0x3297 && hs <= 0x3299) {
        return true
      } else if (
        hs === 0xa9 ||
        hs === 0xae ||
        hs === 0x303d ||
        hs === 0x3030 ||
        hs === 0x2b55 ||
        hs === 0x2b1c ||
        hs === 0x2b1b ||
        hs === 0x2b50
      ) {
        return true
      }
    }
  }
  return false
}

export function getClassAndState(status) {
  let statusClass = ''
  let statusName = ''
  switch (status) {
    case -1:
      statusClass = 'wait'
      statusName = i18n('status_1', '待处理')
      break
    case 1:
      statusClass = 'process'
      statusName = i18n('status_1', '待处理')
      break
    case 2:
    case 11:
      statusClass = 'process'
      statusName = i18n('status_2', '处理中')
      break
    case 3:
    case 7:
      statusClass = 'finish'
      statusName = i18n('status_3', '已完成')
      break
    case 6:
      statusClass = 'wait'
      statusName = i18n('status_22', '跳过')
      break
    case 10:
      statusClass = 'wait'
      statusName = i18n('status_10', '挂起')
      break
    default:
      statusClass = 'wait'
      statusName = i18n('status_1', '待处理')
      break
  }
  return {
    statusClass,
    statusName
  }
}

/**
 * @param  {number}  status 自动环节状态
 * @return {object}  statusClass: 状态类名; statusName: 状态名称
 */
export function getAutoClassAndState(status) {
  let statusClass = ''
  let statusName = ''
  switch (status) {
    case 0:
      statusClass = 'wait'
      statusName = i18n('job_status0', '未执行')
      break
    case 1:
      statusClass = 'process'
      statusName = i18n('job_status1', '执行中')
      break
    case 2:
      statusClass = 'finish'
      statusName = i18n('job_status2', '执行成功')
      break
    case 3:
      statusClass = 'finish'
      statusName = i18n('job_status3', '执行失败')
      break
    default:
      return
  }
  return {
    statusClass,
    statusName
  }
}

/*
 * 会签数组
 *
 * 0: 非会签;
 * 1: 会签
 * 2: 依次会签
 */
export const counterSingArray = [
  '',
  i18n('counter_sign', '会签'),
  i18n('seqcounter_sign', '依次会签')
]

const isChartDataValid = (keys) => {
  const keyArray = ['flowChartVos', 'activityFlowTaskVos'] // flowChartVos: nodes, activityFlowTaskVos: links
  return _.every(keys, (key) => _.includes(keyArray, key))
}
const formatNameTip = (data) => {
  return `<ul class="chart-tip">
      <li>
        <span class="title">${i18n('type', '类型')}</span>
        <span class="content">${
          +data.counterSign === 2 ? i18n('counterSign', '依次会签') : data.typeString
        }</span
      </li>
      <li>
        <span class="title">${i18n('name', '名称')}</span>
        <span class="content">${data.name}</span
      </li>
    </ul>`
}
const formatTip = (data) => {
  return `<ul class="chart-tip">
      <li>
        <span class="title">${i18n('type', '类型')}</span>
        <span class="content">${
          +data.counterSign === 2 ? i18n('counterSign', '依次会签') : data.typeString
        }</span
      </li>
      <li>
        <span class="title">${i18n('name', '名称')}</span>
        <span class="content">${data.name}</span
      </li>
      <li>
        <span class="title">${i18n('process_status', '状态')}</span>
        <span style="padding: 2px 5px; border-radius: 2px; background: ${
          ProcessStatus.node[NODE_STATUS[data.passedStatus]].fill
        };border-color: ${
    ProcessStatus.node[NODE_STATUS[data.passedStatus]].stroke
  }" class="content">
          ${ProcessStatus.i18n[NODE_STATUS[data.passedStatus]]}
        </span
      </li>
      ${
        !_.isEmpty(data.exector)
          ? `<li>
        <span class="title">${i18n('process_exector', '处理人')}</span>
        <span class="content">${_.map(data.exector, (p) => p.userName).join(', ')}</span
      </li>`
          : ''
      }
      ${
        !_.isEmpty(data.executionGroup)
          ? `<li>
          <span class="title">${i18n('ticket.list.screen.executGroup', '处理组')}</span>
          <span class="content">${_.map(data.executionGroup, (p) => p.name).join(', ')}</span
        </li>`
          : ''
      }
    </ul>`
}
const formatAutoTip = (data) => {
  return `<ul class="chart-tip chart-tip-over">
      <li>
        <span class="title">${i18n('type', '类型')}</span>
        <span class="content">${
          +data.counterSign === 2 ? i18n('counterSign', '依次会签') : data.typeString
        }</span
      </li>
      <li>
        <span class="title">${i18n('name', '名称')}</span>
        <span class="content">${data.name}</span
      </li>
      <li>
        <span class="title">${i18n('process_status', '状态')}</span>
        <span style="padding: 2px 5px; border-radius: 2px; background: ${
          ProcessStatus.node[NODE_STATUS[data.passedStatus]].fill
        };border-color: ${
    ProcessStatus.node[NODE_STATUS[data.passedStatus]].stroke
  }" class="content">
          ${ProcessStatus.i18n[NODE_STATUS[data.passedStatus]]}
        </span
      </li>
      <li>
        <span class="title">${i18n('process_excute_status', '执行状态')}</span>
        <span class="content">${AUTO_TASK_STATUS[data.jobStatus]}</span
      </li>
      <li>
        <span class="title">${i18n('process_exector', '处理人')}</span>
        <span class="content">${_.map(data.exector, (p) => p.userName).join(', ')}</span
      </li>
    </ul>`
}
export const formatFlowChartData = (data) => {
  if (!isChartDataValid) {
    throw new Error('传入流程图数据有误!')
  }
  const nodes = _.map(data?.flowChartVos, (item) => {
    const data = {
      id: item.id,
      text: item.name,
      width: item.width,
      height: item.height,
      icon: CHART[item.activitiType].icon,
      shape: CHART[item.activitiType].type,
      isDrag: false,
      x: item.x,
      y: item.y
    }
    switch (item.activitiType) {
      case 'ExclusiveGateway':
        data.name = 'X'
        data.tooltipText1 = formatNameTip(item)
        break
      case 'ParallelGateway':
        data.name = 'O'
        data.tooltipText1 = formatNameTip(item)
        break
      case 'AutoTask':
        // if (item.autoUrl) {
        //     data.onClick = () => {
        //         window.open(window.location.origin + item.autoUrl)
        //     }
        // }
        data.tooltipText1 = formatAutoTip(item)
        data.cursor = 'pointer'
        break
      case 'SubProcess':
        if (item.childModelId) {
          data.cursor = 'pointer'
        }
        data.tooltipText1 = formatTip(item)
        break
      default:
        data.tooltipText1 = formatTip(item)
        break
    }
    return data
  })

  const links = _.orderBy(data?.activityFlowTaskVos, 'highLight').map((item) => {
    let data
    if (Object.keys(item.from || {}).length !== 0) {
      data = {
        id: item.id,
        from: item.from,
        to: item.to,
        visibleText: item.showName,
        text: item.name,
        points: item.points || []
      }
    } else {
      data = linksToLegal(item, nodes)
    }
    return data
  })
  return { nodes, links }
}

export const AUTO_TASK_STATUS = {
  0: i18n('un_execute', '未执行'),
  1: i18n('executing', '执行中'),
  2: i18n('executing_success', '执行成功'),
  3: i18n('waiting_confirm', '等待确认'),
  6: i18n('range_fail', '编排错误'),
  7: i18n('canceled', '已取消'),
  8: i18n('execute_interupt', '执行中断'),
  9: i18n('execute_error', '执行错误')
}

export const CHART = {
  StartNoneEvent: { type: CIRCLE, icon: '' },
  EndNoneEvent: { type: CIRCLE, icon: '' },
  UserTask: { type: RECT, icon: '\uea24' },
  ExclusiveGateway: { type: RHOMB, icon: '\uea25' },
  InclusiveGateway: { type: RHOMB, icon: '\uea22' },
  AutoTask: { type: RECT, icon: '\uea27' },
  ParallelGateway: { type: RHOMB, icon: '\ue88e' },
  SubProcess: { type: RECT, icon: '\uea23' },
  TimingTask: { type: RECT, icon: '\ue791' },
  AutomaticDelivery: { type: RECT, icon: '\ue7de' },
  ApprovalTask: { type: RECT, icon: '\ue7db' },
  RemoteRequest: { type: RECT, icon: '\ue79c' }
}

export const NODE_STATUS = {
  0: 'WAITING',
  1: 'EXECUTING',
  2: 'DONE',
  3: 'PENDING',
  4: 'ERROR'
}

export const ProcessStatus = {
  node: {
    WAITING: {
      stroke: '#B8BEC8',
      fill: '#B8BEC8',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      iconSize: 18
    },
    EXECUTING: {
      stroke: '#3F81E5',
      fill: '#3F81E5',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      iconSize: 18
    },
    PENDING: {
      stroke: '#F49454',
      fill: '#F49454',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      iconSize: 18
    },
    ERROR: {
      stroke: '#F56780',
      fill: '#F56780',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      iconSize: 18
    },
    DONE: {
      stroke: '#0DC28E',
      fill: '#0DC28E',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      iconSize: 18
    }
  },
  i18n: {
    WAITING: i18n('process_status_waiting', '未处理'),
    EXECUTING: i18n('process_status_executing', '处理中'),
    ERROR: i18n('process_status_error', '处理异常'),
    PENDING: i18n('process_status_pending', '挂起中'),
    DONE: i18n('process_status_done', '已处理')
  }
}
