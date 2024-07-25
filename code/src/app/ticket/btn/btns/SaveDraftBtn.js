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
// 保存草稿
const SaveDraftBtn = ({ btnProps }) => {
  const { loading, formList, isReceiveTicket, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, showMore, isUseable } = btnInfo
  const name = buttonName || label
  const { status, isExcutor, unfinishedCoOrder, isSaveOrDraft, inRemoteStatus } = formList
  if (inRemoteStatus !== 0) {
    return null
  }
  if (
    (status === 1 || status === 2) &&
    isUseable &&
    isExcutor &&
    !isReceiveTicket &&
    !unfinishedCoOrder &&
    isSaveOrDraft
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, btnInfo })
      : renderButton({ type, name, loading, onClickBtn })
  }
  return null
}

export default SaveDraftBtn
