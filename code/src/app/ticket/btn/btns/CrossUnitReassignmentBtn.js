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
// 跨单位改派
const CrossUnitReassignmentBtn = ({ btnProps }) => {
  const { loading, formList, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, showMore, isUseable } = btnInfo
  const name = buttonName || label
  const { unitReassignVo, inRemoteStatus } = formList
  const { crossUnitReassign } = unitReassignVo || {}
  if (inRemoteStatus !== 0) {
    return null
  }
  if (
    crossUnitReassign === 1 &&
    window.localStorage.getItem('crossUnitReassign') === '1' &&
    isUseable
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, btnInfo })
      : renderButton({ type, name, loading, onClickBtn })
  }
  return null
}

export default CrossUnitReassignmentBtn
