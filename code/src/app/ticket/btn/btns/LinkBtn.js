import React from 'react'
import { Button, Menu, Tooltip } from '@uyun/components'

const renderButton = ({
  type,
  name,
  ruleInfo,
  disabled,
  loading,
  onClickBtn,
  operateRestrictList,
  restrictBtns
}) => {
  let restrictBtnArrays = restrictBtns === undefined ? operateRestrictList : restrictBtns
  if (
    restrictBtnArrays &&
    restrictBtnArrays.length > 0 &&
    restrictBtnArrays.some(
      (d) => Array.isArray(d.submitFlowCodes) && d.submitFlowCodes.includes(ruleInfo.flowCode)
    )
  ) {
    return (
      <Tooltip title={restrictBtnArrays[0].operateRestrictReason}>
        <Button
          type="primary"
          onClick={() => onClickBtn(type, ruleInfo)}
          key={`${type}_${ruleInfo.activityFlowId}`}
          disabled
          loading={!!loading}
        >
          {name}
        </Button>
      </Tooltip>
    )
  }
  return (
    <Button
      type="primary"
      onClick={() => onClickBtn(type, ruleInfo)}
      key={`${type}_${ruleInfo.activityFlowId}`}
      disabled={disabled}
      loading={!!loading}
    >
      {name}
    </Button>
  )
}
const renderMenuItem = ({ type, name, ruleInfo, disabled, btnInfo }) => {
  return (
    <Menu.Item
      key={`${type}_${ruleInfo.activityFlowId}`}
      type={type}
      rule_info={ruleInfo}
      btn_info={btnInfo}
      disabled={disabled}
    >
      {name}
    </Menu.Item>
  )
}

const LinkBtn = ({ btnProps, restrictBtns }) => {
  const { visible, loading, formList, isReceiveTicket, modelRule, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, showMore, activityFlowId, isUseable } = btnInfo
  const name = buttonName || label || '提交'
  const disabled = visible
  const {
    status,
    isExcutor,
    unfinishedCoOrder,
    isCountersign,
    canSubmit,
    quickRollback,
    remoteQuickRollBack,
    unitReassignVo,
    inRemoteStatus,
    operateRestrictList
  } = formList
  if (inRemoteStatus !== 0) {
    return null
  }
  const { ruleVos = [], modelType } = modelRule
  // 这里按activityFlowId来关联这个规则, 和审批节点(同意和驳回)的关联不一样
  const ruleInfo = ruleVos.find((item) => item.activityFlowId === activityFlowId)
  // 如果关联没找到
  if (!ruleInfo) {
    return null
  }
  // 存在跨租户提交时，或快速回退提交是，则屏蔽普通提交按钮
  if (!canSubmit || unitReassignVo.crossUnitCommit === 1 || quickRollback || remoteQuickRollBack) {
    return null
  }
  // 显示按钮的权限
  if (
    status === 2 &&
    isExcutor &&
    !isReceiveTicket &&
    isUseable &&
    !unfinishedCoOrder &&
    (modelType === 1 || !isCountersign)
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, ruleInfo, disabled, btnInfo })
      : renderButton({
          type,
          name,
          ruleInfo,
          disabled,
          loading,
          onClickBtn,
          operateRestrictList,
          restrictBtns
        })
  }
  return null
}

export default LinkBtn
