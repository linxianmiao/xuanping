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
// 加签
const AddSignBtn = ({ btnProps }) => {
  const { loading, btnVisible, formList, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, showMore, isUseable } = btnInfo
  const name = buttonName || label
  const {
    status,
    isExcutor,
    isAppManager,
    isModelManager,
    canAddSign,
    quickRollback,
    remoteQuickRollBack,
    inRemoteStatus
  } = formList
  const disabled = status !== 2 // 未接单时，加签禁用
  if (inRemoteStatus !== 0) {
    return null
  }
  if (
    ((status === 1 && isUseable && (isAppManager || isModelManager)) ||
      (status === 2 && isExcutor)) &&
    canAddSign &&
    !quickRollback &&
    !remoteQuickRollBack
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, disabled, btnInfo })
      : renderButton({ type, name, disabled, loading, onClickBtn })
  }
  return null
}

export default AddSignBtn
