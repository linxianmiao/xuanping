import React from 'react'
import { Button, Menu } from '@uyun/components'

const renderButton = ({ type, name, loading, onClickBtn }) => {
  return (
    <Button key={type} onClick={() => onClickBtn(type)} loading={!!loading}>
      {name}
    </Button>
  )
}
const renderMenuItem = ({ type, name, btnInfo }) => {
  return (
    <Menu.Item key={type} type={type} btn_info={btnInfo}>
      {name}
    </Menu.Item>
  )
}
// 挂起和恢复
const SuspendBtn = ({ btnProps }) => {
  const { loading, formList, isReceiveTicket, btnInfo, onClickBtn } = btnProps
  const {
    type,
    label,
    buttonName,
    buttonNameAntonym,
    defaultAntonym,
    defaultAntonymType,
    showMore
  } = btnInfo
  const name = buttonName || label
  const relationName = buttonNameAntonym || defaultAntonym
  const {
    status,
    isExcutor,
    isManager,
    activityType,
    unfinishedCoOrder,
    canSuspend,
    modelUseManager,
    canResume,
    remoteQuickRollBack,
    inRemoteStatus
  } = formList
  if (inRemoteStatus !== 0) {
    return null
  }
  // 挂起
  if (
    activityType !== 'AutoTask' &&
    !formList.isReceiveTicket &&
    canSuspend &&
    ((status === 12 && (isExcutor || isManager || modelUseManager)) ||
      ((status === 1 || status === 2) &&
        (modelUseManager ||
          (isManager && !isExcutor) ||
          (isExcutor && (isReceiveTicket || !unfinishedCoOrder)))))
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, btnInfo })
      : renderButton({ type, name, loading, onClickBtn })
  }
  // 恢复(recovery)
  if (
    status === 10 &&
    remoteQuickRollBack !== 1 &&
    (isExcutor || isManager || modelUseManager) &&
    activityType !== 'AutoTask' &&
    !formList.isReceiveTicket &&
    canResume &&
    !formList?.remoteTicketNode
  ) {
    return showMore === 1
      ? renderMenuItem({ type: defaultAntonymType, name: relationName, btnInfo })
      : renderButton({ type: defaultAntonymType, name: relationName, loading, onClickBtn })
  }

  return null
}

export default SuspendBtn
