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
// 关闭和重开
const CloseBtn = ({ btnProps }) => {
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
    unfinishedCoOrder,
    isCanClose,
    modelUseManager,
    isOrgMember,
    isModelManager,
    isManager,
    isCreator,
    isReopen,
    inRemoteStatus
  } = formList
  if (inRemoteStatus !== 0) {
    return null
  }
  // 关闭
  if (
    (status === 1 || status === 2) &&
    (isExcutor || modelUseManager) &&
    isCanClose &&
    (isReceiveTicket || !unfinishedCoOrder)
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, btnInfo })
      : renderButton({ type, name, loading, onClickBtn })
  }
  // 重开（reopen）
  if (
    (status === 3 || status === 7 || status === 12) &&
    (isOrgMember || isModelManager || isManager || isCreator || isExcutor) &&
    isReopen === 1
  ) {
    return showMore === 1
      ? renderMenuItem({ type: defaultAntonymType, name: relationName, btnInfo })
      : renderButton({ type: defaultAntonymType, name: relationName, loading, onClickBtn })
  }
  return null
}

export default CloseBtn
