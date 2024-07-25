import React from 'react'
import { Button, Menu } from '@uyun/components'

const renderButton = ({ type, name, disabled, loading, onClickBtn }) => {
  return (
    <Button
      onClick={() => onClickBtn(type)}
      type="primary"
      key={type}
      disabled={disabled}
      loading={!!loading}
    >
      {name}
    </Button>
  )
}
const renderMenuItem = ({ type, name, disabled, btnInfo }) => {
  return (
    <Menu.Item key={type} type={type} btn_info={btnInfo} disabled={disabled}>
      {name}
    </Menu.Item>
  )
}

// 接单
const AcceptBtn = ({ btnProps }) => {
  const { loading, btnVisible, formList, isReceiveTicket, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, showMore, isUseable } = btnInfo
  const name = buttonName || label
  const disabled = btnVisible
  const { status, isExcutor, inRemoteStatus } = formList
  if (inRemoteStatus !== 0) {
    return null
  }
  if ((status === 1 || status === 2) && isUseable && isExcutor && isReceiveTicket) {
    return showMore === 1
      ? renderMenuItem({ type, name, disabled, btnInfo })
      : renderButton({ type, name, disabled, loading, onClickBtn })
  }
  return null
}

export default AcceptBtn
