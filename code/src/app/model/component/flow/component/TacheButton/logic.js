/** 一个按钮的属性:
 * label: 按钮内置名称
 * type：按钮类型, 如果是线 type === 'activity_flow_button'
 * showMore： 0 便捷操作，1 更多操作
 * buttonName：按钮别名
 * desc: 按钮的描述
 * isUseable：是否启用 1 启用，0未启用
 * configSub: 是否需要配置附属信息
 * isEditName: 是否可以修改按钮名称
 * isRequiredHandingSuggestion： 处理意见（0选填，1必填，2隐藏）
 * dealSuggestionText: 处理意见的别名
 * defaultAntonym: 默认的关联名称 (关联按钮关系： 挂起-->恢复，关闭-->重开，废除-->还原)
 * defaultAntonymType: 关联名称类型
 * buttonNameAntonym：按钮的关联名称
 * disabled： 是否禁用 启用操作
 * activityFlowId: 线的id
 *
 *
 * **** 回退的字段 ****
 * rollbackWay: 回退配置值（0逐级回退，1自由回退，2定点回退）
 * rollbackTache: 定点回退的指定节点
 * rollbackProcess: 回退的路线a（优先回退到处理组，无处理组则回退到处理人）
 * rollbackResumeType: 回退的路线b (回退后再提交将直达当前节点 || 处理人选择回退再提交方式) 两者只能选一
 *
 * **** 远程工单的字段 ****
 * remoteNodeMode： 0固定节点 || 1人工选择
 * remoteNodeInfos:
 *
 */
export const buttonAttr = {
  label: '',
  type: '',
  showMore: 0,
  disabled: false,
  buttonName: '',
  desc: '',
  isUseable: 1,
  configSub: true,
  isEditName: true,
  isRequiredHandingSuggestion: 0,
  dealSuggestionText: '',
  buttonNameAntonym: '',
  defaultAntonym: '',
  defaultAntonymType: '',
  activityFlowId: ''
}

// 节点按钮，人工节点的线按钮需动态获取，意审批节点的线按钮是: 同意和驳回 两个按钮
export const defaultTacheButton = [
  {
    ...buttonAttr,
    label: '接单',
    type: 'accept',
    showMore: 0,
    disabled: true,
    configSub: false
  },
  {
    ...buttonAttr,
    label: '同意',
    type: 'agree',
    disabled: true
  },
  {
    ...buttonAttr,
    label: '驳回',
    type: 'reject',
    disabled: true
  },
  // {
  //   ...buttonAttr,
  //   label: '拒绝',
  //   type: 'refuse',
  //   disabled: true
  // },
  // {
  //   ...buttonAttr,
  //   label: '失败',
  //   type: 'fail',
  //   disabled: true
  // },
  // {
  //   ...buttonAttr,
  //   label: '成功',
  //   type: 'sucess',
  //   disabled: true
  // },
  {
    ...buttonAttr,
    label: '改派',
    type: 'reassignment'
  },
  {
    ...buttonAttr,
    label: '跨单位改派',
    type: 'cross_unit_reassignment'
  },
  {
    ...buttonAttr,
    label: '挂起',
    type: 'suspend',
    defaultAntonym: '恢复', // type 为recovery
    defaultAntonymType: 'recovery'
  },
  {
    ...buttonAttr,
    label: '增加会签人',
    type: 'add_multi_performer'
  },
  {
    ...buttonAttr,
    label: '催办',
    type: 'reminder'
    // defaultAntonym: '已催办'
  },
  {
    ...buttonAttr,
    label: '回退',
    type: 'rollback',
    rollbackWay: 0,
    rollbackTache: null,
    rollbackProcess: 0,
    rollbackResumeType: 0
  },
  {
    ...buttonAttr,
    label: '远程回退',
    isUseable: 0,
    showMore: 1,
    type: 'remote_roll_back',
    rollbackWay: 1,
    rollbackTache: null,
    rollbackProcess: 0,
    rollbackResumeType: 0
  },
  {
    ...buttonAttr,
    label: '关闭',
    type: 'close',
    showMore: 1,
    defaultAntonym: '重开',
    defaultAntonymType: 'reopen'
  },
  {
    ...buttonAttr,
    label: '废除',
    type: 'abolish',
    showMore: 1,
    defaultAntonym: '还原',
    defaultAntonymType: 'restore'
  },
  {
    ...buttonAttr,
    label: '加签',
    type: 'addSign',
    showMore: 1,
    desc: '在当前节点之后增加新的审批节点'
  },
  {
    ...buttonAttr,
    label: '取回',
    type: 'revoke',
    showMore: 1
  },
  {
    ...buttonAttr,
    label: '远程工单',
    type: 'remote_ticket',
    showMore: 1,
    remoteNodeMode: 0,
    remoteNodeInfos: null
  },
  {
    ...buttonAttr,
    label: '更新数据',
    type: 'updateData',
    showMore: 1,
    configSub: false
  },
  {
    ...buttonAttr,
    label: '保存草稿',
    type: 'saveDraft',
    showMore: 1,
    configSub: false
  },
  {
    ...buttonAttr,
    label: '审阅',
    type: 'reviewed',
    showMore: 1,
    defaultAntonym: '已审阅'
  },
  {
    ...buttonAttr,
    label: '抄送',
    type: 'cc',
    showMore: 1
  },
  {
    ...buttonAttr,
    label: '自动审批', // 这个按钮不会在详情按钮里显示的，只有启用和不启用的操作，逻辑都在服务端 ; (只是为了兼容老数据，其实不应该放在按钮组件里配置)
    type: 'auto_approval',
    showMore: 1,
    configSub: false,
    isEditName: false
  },
  {
    ...buttonAttr,
    label: '协办',
    type: 'CoOrganizer',
    showMore: 1
  }
]

// 便捷操作 || 更多操作
export const operationList = [
  {
    name: '便捷操作',
    type: 0 // 和showMore对应
  },
  {
    name: '更多操作',
    type: 1 // 和showMore对应
  }
]
/**
 * 根据不同的节点类型来获取不同的默认按钮
 * @param {*} types 需要哪些类型或不需要哪些类型，需和mode来控制
 * @param {*} mode mode === false(包含types的值) mode === true (过滤不包含types的值)
 * @returns
 */
const getTacheButton = (types = [], mode) => {
  return mode
    ? defaultTacheButton.filter((item) => types.indexOf(item.type) === -1)
    : defaultTacheButton.filter((item) => types.indexOf(item.type) >= -1)
}

// 获取人工节点的操作按钮
export const getUserTaskTacheButton = () => {
  // 不包含的类型
  const notTypes = ['agree', 'reject', 'auto_approval']
  return getTacheButton(notTypes, true)
}

// 获取审批节点的操作按钮
export const getApprovalTaskTacheButton = () => {
  // 不包含的类型
  const notTypes = ['cross_unit_reassignment', 'CoOrganizer']
  return getTacheButton(notTypes, true)
}

// 获取不同类型的节点的按钮操作
export const getTaskTacheButton = (activitiType) => {
  switch (activitiType) {
    case 'UserTask':
      return getUserTaskTacheButton()
    case 'ApprovalTask':
      return getApprovalTaskTacheButton()
    default:
      return defaultTacheButton
  }
}

// 判断是否是线按钮的数据
const isFlowButton = (activityFlowId, type) => {
  return activityFlowId && type === 'activity_flow_button'
}

/**
 * 节点 增加线按钮（线：增/删/改）的情况，需要实时更新的线按钮，或补充新增的默认按钮，还需注意审批节点的线按钮，其实是 同意和驳回两个按钮
 * @param {*} taskTacheButton 需要处理的节点按钮数据
 * @param {*} tacheId 节点id
 * @param {*} activitiType 节点类型
 * @param {*} links 所有的线
 */
const compateOldandNewData = (taskTacheButton, tacheId, activitiType, links, node = []) => {
  // 人工节点的线按钮(需要和线名称实时同步更新)
  const linkNames = activitiType === 'UserTask' ? getFromLinkName(links, tacheId) : []
  const defaultTacheButton = getTaskTacheButton(activitiType)
  let newTaskTacheButton = []
  let tempList = _.cloneDeep(taskTacheButton)
  // 之前老数据在模型中没有配置线按钮，需要增加线按钮, 放在按钮最前面
  if (taskTacheButton.every((item) => !item.activityFlowId)) {
    if (!_.isEmpty(linkNames)) {
      linkNames[0].isRequiredHandingSuggestion = node[0]?.isRequiredHandingSuggestion || 0
    }
    tempList = [].concat(linkNames, tempList)
  }
  // 保存 少了那部分类型的按钮, 并放在后面
  const defectBtn = []
  defaultTacheButton.forEach((item) => {
    // 这个数据可能还少部分内置类型的按钮，需要从defaultTacheButton中补充上
    if (tempList.every((t) => t.type !== item.type)) {
      defectBtn.push({ ...item })
    }
  })
  newTaskTacheButton = [].concat(tempList, defectBtn).map((item) => {
    if (!item.label) {
      if (isFlowButton(item.activityFlowId, item.type)) {
        return { ...buttonAttr, disabled: true, label: '提交', ...item }
      }
      const currentBtn = defaultTacheButton.find((d) => d.type === item.type) || {}
      return { ...currentBtn, ...item }
    }
    return { ...item }
  })
  /**
   * 线的 增和删 情况处理
   */

  // 1. 删除的情况
  newTaskTacheButton = newTaskTacheButton.filter((item) => {
    // 如果当前id存在且当前线id再linkNames中找不到，表示当前线按钮已删除
    if (!item.activityFlowId || linkNames.find((l) => l.activityFlowId === item.activityFlowId)) {
      return item
    }
  })

  // 2. 新增的情况, 把新的线按钮放在最前面
  const linkButton = newTaskTacheButton.filter((item) =>
    isFlowButton(item.activityFlowId, item.type)
  )
  if (linkButton.length === 0) {
    newTaskTacheButton = [].concat(linkNames, newTaskTacheButton)
  } else {
    const filterLinkNames = linkNames.filter((item) => {
      if (linkButton.every((l) => l.activityFlowId !== item.activityFlowId)) {
        return item
      }
    })
    newTaskTacheButton = [].concat(filterLinkNames, newTaskTacheButton)
  }
  /** *****结束 线 增和删 情况处理 */

  return newTaskTacheButton
}

/**
 * 设置当前节点的按钮数据，（主要是新老数据的兼容）
 * @param {*} tacheButton 节点的按钮（新数据包含了线的按钮，老数据没有线的按钮，且还少了部分按钮，少了都需加上）
 * @param {*} tacheId 节点id
 * @param {*} activitiType 节点类型（不同的节点有不同的按钮）
 * @param {*} links 所有的线（通过节点的id 来获取线的名称，再加入到节点按钮中）
 * @returns
 */
export const setTacheButton = (tacheButton, tacheId, activitiType, links, nodes) => {
  let taskTacheButton = tacheButton
  // tacheButton为空时，给默认数据
  if (!tacheButton || (Array.isArray(tacheButton) && tacheButton.length === 0)) {
    taskTacheButton = getTaskTacheButton(activitiType)
  }

  const node = _.filter(nodes, (item) => item.id === tacheId) || []

  return compateOldandNewData(taskTacheButton, tacheId, activitiType, links || [], node)
}

// 通过当前节点来获取线的按钮（当前节点的出线，而不是进线）
const getFromLinkName = (links, id) => {
  const linkButton = []
  links.forEach((item) => {
    // 出线
    if (item.from && item.from.id === id) {
      linkButton.push({
        ...buttonAttr,
        disabled: true,
        label: '提交',
        buttonName: item.text || item.name,
        type: 'activity_flow_button',
        activityFlowId: item.id
      })
    }
  })
  return linkButton
}
// 获取当前按钮的唯一key
export const getUuid = (activityFlowId, type) => activityFlowId || type

/**
 * 线的按钮和节点的按钮合并
 * @param {*} links 线
 * @param {*} tacheInfo 当前节点
 * @returns
 */
export const getTaskTacheLinksButton = (links, tacheInfo, nodes) => {
  const { tacheButton, id, activitiType } = tacheInfo
  return setTacheButton(tacheButton, id, activitiType, links, nodes)
}

/**
 *
 * @param {*} sortValue 组件排序的数据
 * @param {*} buttonList 按钮数据
 * @param {*} type 操作类型 （0便捷操作，1更多操作）
 * @returns
 */
export const sortButtonList = (sortValue, buttonList, type) => {
  const filterButtonList = buttonList.filter((item) => item.showMore !== type)
  let valueList = _.cloneDeep(sortValue)
  const source = sortValue.find((item) => item.showMore !== type)
  if (source) {
    valueList = valueList.map((item) => {
      item.showMore = type
      return item
    })
  }
  const newValue = [].concat(filterButtonList, valueList)
  return newValue
}
/**
 *
 * @param {*} list 按钮数据集
 * @param {*} field 单个按钮的字段
 * @param {*} uuid 单个按钮的唯一key
 * @param {*} value 单个按钮字段的值
 * @returns
 */
export const changRecordInfoField = (list, field, uuid, value) => {
  return list.map((item) => {
    if (getUuid(item.activityFlowId, item.type) === uuid) {
      item[field] = value
    }
    return { ...item }
  })
}
/**
 *
 * @param {*} list 按钮数据集
 * @param {*} uuid 当前按钮的唯一key
 * @param {*} record 当前按钮的更新数据
 * @returns
 */
export const changRecordInfo = (list, uuid, record, oldInfo) => {
  const { isUseable, buttonName } = oldInfo
  return list.map((item) => {
    if (getUuid(item.activityFlowId, item.type) === uuid) {
      return { ...record, isUseable, buttonName }
    }
    return { ...item }
  })
}

/**
 * 定点回退时，回退到哪个节点（只能回退到 人工节点和开始节点）
 * @param {*} nodes 所有的节点
 * @param {*} id 当前节点的id
 * @returns
 */
export const getFixedRollbackTache = (nodes, id) => {
  return nodes.filter((item) => {
    if (['UserTask', 'StartNoneEvent'].includes(item.activitiType) && item.id !== id) {
      return item
    }
  })
}
/**
 *
 * @param {*} dataSource 节点和线的数据
 * @param {*} id 线ID
 * @param {*} type 节点或线
 * @param {*} activityFlowId 节点中如果有 线 名称需要线的id
 */
export const changeLinkName = (dataSource, id, type, activityFlowId) => {
  let textName = ''
  if (type === 'links') {
    dataSource[type].some((item) => {
      if (item.id === id) {
        textName = item.text
        return true
      }
    })
    dataSource.nodes.forEach((item1) => {
      if (Array.isArray(item1.tacheButton)) {
        item1.tacheButton.forEach((item2) => {
          if (item2.activityFlowId === id) {
            item2.buttonName = textName
          }
        })
      }
    })
  }

  if (type === 'nodes') {
    const linksInfo = []
    dataSource[type].forEach((item1) => {
      if (item1.id === id && Array.isArray(item1.tacheButton)) {
        item1.tacheButton.forEach((item2) => {
          if (activityFlowId && item2.activityFlowId === activityFlowId) {
            linksInfo.push({ name: item2.buttonName, id: item2.activityFlowId })
          }
        })
      }
    })
    dataSource.links.forEach((item) => {
      const info = linksInfo.find((l) => l.id === item.id)
      if (info) {
        item.text = info.name
      }
    })
  }
}

export const tacheButtonToServer = (tacheButton) => {
  return tacheButton.map((item) => {
    return {
      activityFlowId: item.activityFlowId || null,
      buttonName: item.buttonName || '',
      buttonNameAntonym: item.buttonNameAntonym || null,
      dealSuggestionText: item.dealSuggestionText || null,
      isRequiredHandingSuggestion: item.isRequiredHandingSuggestion || 0,
      isUseable: item.isUseable || 0,
      remoteNodeInfos: item.remoteNodeInfos || null,
      remoteNodeMode: item.remoteNodeMode || 0,
      rollbackResumeType: item.rollbackResumeType || 0,
      rollbackTache: item.rollbackTache || null,
      rollbackTacheFree: item.rollbackTacheFree || null,
      rollbackWay: item.rollbackWay || (item.type === 'remote_roll_back' ? 1 : 0),
      showMore: item.showMore || 0,
      type: item.activityFlowId ? 'activity_flow_button' : item.type,
      rejectType: item.rejectType ? item.rejectType : 1,
      rollbackProcess: item.rollbackProcess === undefined ? 1 : item.rollbackProcess
    }
  })
}
