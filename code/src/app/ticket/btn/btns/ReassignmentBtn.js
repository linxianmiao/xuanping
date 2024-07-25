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
// 改派
const ReassignmentBtn = ({ btnProps }) => {
  const { loading, formList, isReceiveTicket, retryJobStatus, btnInfo, onClickBtn } = btnProps
  const { type, label, buttonName, showMore } = btnInfo
  const name = buttonName || label
  const {
    status,
    canReassignment,
    isExcutor,
    unfinishedCoOrder,
    isAppManager,
    isModelManager,
    activityType,
    modelUseManager,
    inRemoteStatus
  } = formList
  // 开始节点不需要改派按钮
  if (activityType === 'StartNoneEvent' || inRemoteStatus !== 0) {
    return null
  }
  if (
    ((status === 1 || status === 2) &&
      canReassignment &&
      (modelUseManager ||
        (isExcutor &&
          ((!isReceiveTicket && !unfinishedCoOrder) ||
            (isReceiveTicket &&
              (isAppManager || isModelManager) &&
              activityType !== 'StartNoneEvent' &&
              activityType !== 'EndNoneEvent'))) ||
        (!isExcutor &&
          (isAppManager || isModelManager) &&
          activityType !== 'StartNoneEvent' &&
          activityType !== 'EndNoneEvent'))) ||
    (isExcutor && retryJobStatus) // 重试作业（让挂起工单可以编辑， 并出现更新、改派、回退按钮）
  ) {
    return showMore === 1
      ? renderMenuItem({ type, name, btnInfo })
      : renderButton({ type, name, loading, onClickBtn })
  }
  return null
}

export default ReassignmentBtn
