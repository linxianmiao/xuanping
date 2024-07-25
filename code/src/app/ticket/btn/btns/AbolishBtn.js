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
// 废除和还原
const AbolishBtn = ({ btnProps }) => {
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
    isAbolish,
    status,
    isModelManager,
    isManager,
    isCreator,
    isExcutor,
    unfinishedCoOrder,
    modelUseManager,
    canRestore,
    inRemoteStatus
  } = formList
  if (inRemoteStatus !== 0) {
    return null
  }
  // 废除
  if (
    isAbolish &&
    (((status === 3 || status === 7 || status === 12) &&
      (modelUseManager || isModelManager || isManager || isCreator)) ||
      ((status === 1 || status === 2) &&
        (modelUseManager ||
          (isExcutor && (isReceiveTicket || !unfinishedCoOrder)) ||
          (!isExcutor && (isModelManager || isManager || isCreator)))))
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, btnInfo })
      : renderButton({ type, name, loading, onClickBtn })
  }
  // 还原（restore）
  if (status === 11 && canRestore) {
    return showMore === 1
      ? renderMenuItem({ type: defaultAntonymType, name: relationName, btnInfo })
      : renderButton({ type: defaultAntonymType, name: relationName, loading, onClickBtn })
  }
  return null
}

export default AbolishBtn
