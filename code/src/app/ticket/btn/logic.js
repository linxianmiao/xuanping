import {
  buttonAttr,
  defaultTacheButton,
  getTaskTacheButton
} from '~/model/component/flow/component/TacheButton/logic'

// 人工节点 才需要整合线按钮 （审批节点不需要， 它只有 同意和驳回两个按钮）
export const getUserTaskLinkBtn = (linksBtn, activityType) => {
  let btn = []
  if (activityType !== 'ApprovalTask') {
    btn = linksBtn.map((item) => {
      return {
        ...buttonAttr,
        buttonName: item.name,
        label: '提交',
        type: 'activity_flow_button',
        activityFlowId: item.activityFlowId
      }
    })
  }
  return btn
}

export const assignDate = (list, linksBtn, activityType, formList = []) => {
  let tempList = list
  const linkBtn = getUserTaskLinkBtn(linksBtn, activityType)
  // 之前老数据在模型中没有配置线按钮，需要增加线按钮, 放在按钮最前面
  if (list.every((item) => !item.activityFlowId)) {
    if (!_.isEmpty(linkBtn)) {
      linkBtn[0].isRequiredHandingSuggestion = formList?.isRequiredHandingSuggestion || 0
    }
    tempList = [].concat(linkBtn, tempList)
  }
  // 这里才判断一下 线按钮，防止线按钮不同步
  linkBtn.forEach((item) => {
    if (tempList.every((t) => t.activityFlowId !== item.activityFlowId)) {
      tempList = [].concat([{ ...item }], tempList)
    }
  })
  const taskBtn = getTaskTacheButton(activityType)
  // 保存 少了那部分类型的按钮, 并放在后面
  const defectBtn = []
  taskBtn.forEach((item) => {
    // 这个数据可能还少部分内置类型的按钮（抄送，更新数据，保存草稿等类型），需要从defaultTacheButton中补充上
    if (tempList.every((t) => t.type !== item.type)) {
      defectBtn.push({ ...item })
    }
  })
  return [].concat(defectBtn, tempList)
}

// 过滤出 便捷操作 和 更多操作
export const getOperationButtonPosition = ({
  list = [],
  modelRule,
  activityType,
  formList = []
}) => {
  // 兼容老数据
  const newList = assignDate(list || [], modelRule.ruleVos || [], activityType, formList)
  const operationMore = []
  const operationAgile = []
  newList.forEach((item) => {
    // 按钮是否已启用
    // if (item.isUseable === 1) {
    const record = defaultTacheButton.find((r) => r.type === item.type) || {}
    // 更多操作
    if (item.showMore === 1) {
      operationMore.push({ ...record, ...item })
    }
    // 便捷操作
    if (item.showMore === 0) {
      operationAgile.push({ ...record, ...item })
    }
    // }
  })
  // 更多里的协办完成按钮
  const finishAssitBtn = {
    label: '协办完成',
    type: 'assistFinish',
    showMore: 1,
    disabled: false
  }
  operationMore.push(finishAssitBtn)

  if (activityType === 'RemoteRequest') {
    const withdrawBtn = {
      label: '撤回',
      type: 'retrieveRemoteTicket',
      showMore: 0,
      disabled: false
    }
    operationAgile.push(withdrawBtn)
  }
  return { operationAgile, operationMore }
}

export const getBtnConfigProperty = ({
  type,
  activityFlowId,
  label,
  buttonName,
  dealSuggestionText,
  isRequiredHandingSuggestion,
  buttonNameAntonym,
  rollbackResumeType,
  rollbackWay
}) => {
  return {
    label,
    btnType: type,
    activityFlowId: activityFlowId,
    modalTitle: buttonName || label,
    messageName: dealSuggestionText || '意见',
    messageStatus: isRequiredHandingSuggestion,
    relationTitle: buttonNameAntonym,
    rollbackResumeType: rollbackResumeType,
    rollbackWay
  }
}
// 提交线 按钮
export const getLinkBtnInfo = (currentJump = {}, btnInfo) => {
  const { btnType, label, activityFlowId } = btnInfo
  if (btnType === 'agree' && currentJump.title === label) {
    return btnInfo
  }
  if (btnType === 'reject' && currentJump.title === label) {
    return btnInfo
  }
  if (activityFlowId && activityFlowId === currentJump.activityFlowId) {
    return btnInfo
  }
  return {}
}
