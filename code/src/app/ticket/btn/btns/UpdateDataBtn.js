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
// 更新数据
const UpdateDataBtn = ({ btnProps }) => {
  const { loading, formList, isReceiveTicket, retryJobStatus, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, showMore, isUseable } = btnInfo
  const name = buttonName || label
  const { status, isExcutor, unfinishedCoOrder, inRemoteStatus } = formList
  if (inRemoteStatus !== 0) {
    return null
  }
  if (
    ((status === 1 || status === 2) &&
      isUseable &&
      isExcutor &&
      !isReceiveTicket &&
      !unfinishedCoOrder) ||
    (isExcutor && retryJobStatus)
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, btnInfo })
      : renderButton({ type, name, loading, onClickBtn })
  }
  return null
}

export default UpdateDataBtn
