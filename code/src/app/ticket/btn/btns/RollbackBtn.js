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

const renderFreeRollbackButton = ({
  type,
  name,
  rollBackList,
  rollbackWay,
  onClickBtn,
  loading,
  handleLoadRollBack
}) => {
  return (
    <Dropdown
      key={type}
      disabled={!!loading}
      trigger={['hover']}
      overlay={
        <Menu onClick={(item) => onClickBtn(type, { rollbackWay, tacheId: item.key })}>
          {rollBackList.map((item) => (
            <Menu.Item key={item.tacheId}>{item.tacheName}</Menu.Item>
          ))}
        </Menu>
      }
      onVisibleChange={handleLoadRollBack}
    >
      <Button>
        {name}
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

const renderFreeRollbackMenuItem = ({ type, name, rollBackList, rollbackWay, btnInfo }) => {
  return (
    <Menu.SubMenu title={name} key={type} type={type}>
      {rollBackList.map((item) => (
        <Menu.Item
          key={item.tacheId}
          type={item.tacheId}
          rollbackInfo={{ rollbackWay, tacheId: item.tacheId }}
          btn_info={btnInfo}
        >
          {item.tacheName}
        </Menu.Item>
      ))}
    </Menu.SubMenu>
  )
}
// 回退
const RollbackBtn = ({ btnProps }) => {
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
  const {
    status,
    inRemoteStatus,
    remoteQuickRollBack,
    isExcutor,
    unfinishedCoOrder,
    isCanRollBack,
    quickRollback,
    rollbackWay
  } = formList
  if (inRemoteStatus !== 0 || remoteQuickRollBack || quickRollback) {
    return null
  }
  if (
    ((status === 1 || status === 2) &&
      isUseable &&
      isExcutor &&
      !isReceiveTicket &&
      !unfinishedCoOrder &&
      isCanRollBack) ||
    (isExcutor && retryJobStatus) // 重试作业（让挂起工单可以编辑， 并出现更新、改派、回退按钮）
  ) {
    // 自由回退
    if (rollbackWay === 1) {
      return showMore === 1
        ? renderFreeRollbackMenuItem({ type, name, rollbackWay, rollBackList, btnInfo })
        : renderFreeRollbackButton({
            type,
            name,
            rollbackWay,
            rollBackList,
            handleLoadRollBack,
            loading,
            onClickBtn
          })
    }
    // 逐级回退(rollbackWay === 0)和定点回退(rollbackWay === 2)
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

export default RollbackBtn
