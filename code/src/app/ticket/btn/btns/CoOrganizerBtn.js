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
// 协办
const CoOrganizerBtn = ({ btnProps }) => {
  const { loading, formList, btnInfo, coOperation, onClickBtn } = btnProps

  const { createRelateTicket, createCoOrganizer } = coOperation
  const { type, label, buttonName, showMore } = btnInfo
  const name = buttonName || label

  if (createCoOrganizer) {
    return showMore === 1
      ? renderMenuItem({ type, name, btnInfo })
      : renderButton({ type, name, loading, onClickBtn })
  }
  return null
}

export default CoOrganizerBtn
