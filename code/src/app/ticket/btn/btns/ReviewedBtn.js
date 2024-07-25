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
// 审阅
const ReviewedBtn = ({ btnProps }) => {
  const { loading, approved, formList, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, buttonNameAntonym, defaultAntonym, showMore, isUseable } =
    btnInfo
  const disabled = approved
  const name = !disabled ? buttonName || label : buttonNameAntonym || defaultAntonym
  const { status, isApprove, inRemoteStatus } = formList
  if (
    inRemoteStatus === 0 &&
    isApprove === 1 &&
    isUseable &&
    (status === 1 || status === 2 || status === 3)
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, disabled, btnInfo })
      : renderButton({ type, name, disabled, loading, onClickBtn })
  }
  return null
}

export default ReviewedBtn
