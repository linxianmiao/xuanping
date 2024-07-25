import React from 'react'
import { Spin } from '@uyun/components'

const TacheInfo = (props) => {
  const { data = {}, loading } = props
  const { tacheOrder, name, executors, executiveGroups, handlingTime, handlingOpinions } = data
  let userAndGroup = []

  if (executors && executors.length > 0) {
    userAndGroup = userAndGroup.concat(executors)
  }
  if (executiveGroups && executiveGroups.length > 0) {
    userAndGroup = userAndGroup.concat(executiveGroups)
  }

  return (
    <Spin spinning={loading}>
      <div>
        <label>
          {tacheOrder === 'up' ? i18n('prev.stage', '上一阶段') : i18n('next.stage', '下一阶段')}：
        </label>
        <span>{name}</span>
      </div>
      {userAndGroup.length > 0 ? (
        <div>
          <label>{i18n('ticket.relateTicket.handle', '处理组/人')}：</label>
          <span>{userAndGroup.join(', ')}</span>
        </div>
      ) : null}
      {handlingTime ? (
        <div>
          <label>{i18n('config.trigger.resolve_time', '处理时间')}：</label>
          <span>{handlingTime}</span>
        </div>
      ) : null}
      {handlingOpinions ? (
        <div>
          <label>{i18n('ticket.record.advice', '处理意见')}：</label>
          <span>{handlingOpinions}</span>
        </div>
      ) : null}
    </Spin>
  )
}

export default TacheInfo
