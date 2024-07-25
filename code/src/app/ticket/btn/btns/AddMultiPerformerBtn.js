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
// 增加会签人
const AddMultiPerformerBtn = ({ btnProps }) => {
  const { loading, formList, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, showMore, isUseable } = btnInfo
  const name = buttonName || label
  const { canAddMultiPerformer, status, isExcutor, isAppManager, isModelManager, inRemoteStatus } =
    formList
  if (inRemoteStatus !== 0) {
    return null
  }
  if (
    canAddMultiPerformer === 1 &&
    isUseable &&
    (status === 1 || status === 2) &&
    (isExcutor || isAppManager || isModelManager)
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, btnInfo })
      : renderButton({ type, name, loading, onClickBtn })
  }
  return null
}

export default AddMultiPerformerBtn
