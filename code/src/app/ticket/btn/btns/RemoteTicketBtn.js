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
// 远程工单
const RemoteTicketBtn = ({ btnProps }) => {
  const { loading, formList, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, showMore, isUseable } = btnInfo
  const name = buttonName || label
  const { canRemoteTicket, isExcutor, inRemoteStatus } = formList
  if (canRemoteTicket && isExcutor && isUseable && inRemoteStatus === 0) {
    return showMore === 1
      ? renderMenuItem({ type, name, btnInfo })
      : renderButton({ type, name, loading, onClickBtn })
  }
  return null
}

export default RemoteTicketBtn
