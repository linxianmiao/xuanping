import React from 'react'
import { Button, Menu } from '@uyun/components'

const renderButton = ({ type, name, disabled, loading, onClickBtn }) => {
  return (
    <Button key={type} disabled={disabled} onClick={() => onClickBtn(type)} loading={!!loading}>
      {name}
    </Button>
  )
}
const renderMenuItem = ({ type, name, disabled, btnInfo }) => {
  return (
    <Menu.Item key={type} disabled={disabled} type={type} btn_info={btnInfo}>
      {name}
    </Menu.Item>
  )
}
// 催办
const ReminderBtn = ({ btnProps }) => {
  const { loading, formList, isReceiveTicket, unfinishedCoOrder, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, buttonNameAntonym, defaultAntonym, showMore, isUseable } =
    btnInfo
  const {
    status,
    isOrgMember,
    isModelManager,
    isManager,
    isCreator,
    isExcutor,
    canRemind,
    activityType,
    inRemoteStatus
  } = formList
  const disabled = canRemind === 0
  const name = canRemind === 1 ? buttonName || label : buttonNameAntonym || defaultAntonym
  // 开始节点不需要催办按钮
  if (activityType === 'StartNoneEvent' || inRemoteStatus !== 0) {
    return null
  }
  if (
    canRemind !== 2 &&
    isUseable &&
    (((status === 3 || status === 7 || status === 12) &&
      (isOrgMember || isModelManager || isManager || isCreator || isExcutor)) ||
      ((status === 1 || status === 2) &&
        ((isExcutor && (isReceiveTicket || !unfinishedCoOrder)) ||
          (!isExcutor && (isModelManager || isManager || isCreator)))))
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, disabled, btnInfo })
      : renderButton({ type, name, disabled, loading, onClickBtn })
  }
  return null
}

export default ReminderBtn
