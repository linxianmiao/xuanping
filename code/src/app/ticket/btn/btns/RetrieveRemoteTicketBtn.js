import React from 'react'
import { DownOutlined } from '@uyun/icons'
import { Button, Menu, Dropdown, Icon } from '@uyun/components'

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

// 回退
const RetrieveRemoteTicketBtn = ({ btnProps }) => {
  const { loading, formList, btnInfo, onClickBtn } = btnProps

  const { type, label, buttonName, showMore, isUseable } = btnInfo
  const name = buttonName || label
  // const {
  //   status,
  //   inRemoteStatus,
  //   remoteQuickRollBack,
  //   isExcutor,
  //   unfinishedCoOrder,
  //   isCanRollBack,
  //   quickRollback,
  //   rollbackWay
  // } = formList

  return showMore === 1
    ? renderMenuItem({ type, name, btnInfo })
    : renderButton({
        type,
        name,
        loading,
        onClickBtn
      })
}

export default RetrieveRemoteTicketBtn
