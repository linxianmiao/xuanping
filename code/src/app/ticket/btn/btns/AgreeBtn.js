import React from 'react'
import { Button, Menu } from '@uyun/components'

const renderButton = ({ type, name, ruleInfo, loading, onClickBtn }) => {
  return (
    <Button
      key={type}
      onClick={() => onClickBtn(type, ruleInfo)}
      type="primary"
      loading={!!loading}
    >
      {name}
    </Button>
  )
}
const renderMenuItem = ({ type, name, ruleInfo, btnInfo }) => {
  return (
    <Menu.Item key={type} type={type} rule_info={ruleInfo} btn_info={btnInfo}>
      {name}
    </Menu.Item>
  )
}
// 同意按钮 （审批节点才有）
const AgreeBtn = ({ btnProps }) => {
  const { loading, formList, isReceiveTicket, modelRule = {}, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, showMore, isUseable } = btnInfo
  const name = buttonName || label
  const { ruleVos = [], modelType } = modelRule
  // 服务端没有做类型关联，这里只能按名称来关联这个规则（太low了,得注意 英文情况），而不是用线的activityFlowId
  const ruleInfo = ruleVos.find((item) => item.name === label)
  // 如果关联没找到
  if (!ruleInfo) {
    return null
  }
  const {
    status,
    isExcutor,
    unfinishedCoOrder,
    isCountersign,
    canSubmit,
    unitReassignVo,
    quickRollback,
    remoteQuickRollBack,
    inRemoteStatus
  } = formList

  // 存在跨租户提交时，或快速回退提交是，屏蔽普通提交按钮
  if (
    !canSubmit ||
    unitReassignVo.crossUnitCommit === 1 ||
    quickRollback ||
    remoteQuickRollBack ||
    inRemoteStatus !== 0
  ) {
    return null
  }
  // 显示按钮的权限
  if (
    status === 2 &&
    isExcutor &&
    !isReceiveTicket &&
    !unfinishedCoOrder &&
    isUseable &&
    (modelType === 1 || !isCountersign)
  ) {
    if (ruleInfo.ruleType === 1) {
      return showMore === 1
        ? renderMenuItem({ type, name, ruleInfo, btnInfo })
        : renderButton({ type, name, ruleInfo, loading, onClickBtn })
    }
    return null
  }

  return null
}

export default AgreeBtn
