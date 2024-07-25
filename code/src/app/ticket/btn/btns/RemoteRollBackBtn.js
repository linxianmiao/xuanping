import React from 'react'
import { DownOutlined } from '@uyun/icons'
import { Button, Menu, Dropdown, Icon } from '@uyun/components'

const renderButton = ({ type, name, loading, rollbackWay, onClickBtn }) => {
  return (
    <Button key={type} onClick={() => onClickBtn(type, { rollbackWay })} loading={!!loading}>
      {name}
    </Button>
  )
}
const renderMenuItem = ({ type, name, rollbackWay, btnInfo }) => {
  return (
    <Menu.Item key={type} type={type} btn_info={btnInfo} rollbackInfo={{ rollbackWay }}>
      {name}
    </Menu.Item>
  )
}

// 回退
const RemoteRollBackBtn = ({ btnProps }) => {
  const {
    loading,
    formList,
    isReceiveTicket,
    retryJobStatus,
    btnInfo,
    rollBackList,
    handleLoadRollBack,
    onClickBtn
  } = btnProps
  const { type, label, buttonName, showMore, isUseable } = btnInfo
  const name = buttonName || label
  const { status, isExcutor, unfinishedCoOrder, isCanRemoteRollback, rollbackWay } = formList
  if (
    (status === 1 || status === 2) &&
    isUseable &&
    isExcutor &&
    // !isReceiveTicket &&
    !unfinishedCoOrder &&
    isCanRemoteRollback
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, rollbackWay, btnInfo })
      : renderButton({
          type,
          name,
          rollbackWay,
          loading,
          onClickBtn
        })
  }

  return null
}

export default RemoteRollBackBtn
