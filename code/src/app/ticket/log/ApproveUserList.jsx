import React, { useState } from 'react'
import { Tooltip } from '@uyun/components'
import styles from './index.module.less'

const INIT_USER_NUMBER = 3  // 初始显示的用户数量

const ApproveUserList = props => {
  const { users, renderNameTip } = props
  const [expand, setExpand] = useState(false)

  const renderState = state => state === 1
    ? (
      <>
        <i className="iconfont icon-zhixingchenggong" />
        {i18n('reviewed1', '已审')}
      </>
    ) : (
      <>
        <i className="iconfont icon-zhixingzhong" />
        {i18n('review1', '待审')}
      </>
    )

  // 排序 已审阅在前，待审阅在后
  const sortUsers = users => {
    let group1 = [] // 已审阅
    let group2 = [] // 待审阅

    users.forEach(user => {
      if (user.state === 1) {
        group1.push(user)
      } else {
        group2.push(user)
      }
    })

    return group1.concat(group2)
  }

  const showUsers = sortUsers(users).slice(0, expand ? undefined : INIT_USER_NUMBER)

  return (
    <div className={styles.userList}>
      {
        showUsers.map((item, index) => (
          <div key={index} className={styles.userItem}>
            <Tooltip title={renderNameTip(item)}>
              <span className={styles.userName}>{item.userName}</span>
            </Tooltip>
            <span className={styles.state}>
              {renderState(item.state)}
            </span>
          </div>
        ))
      }
      {
        users.length > INIT_USER_NUMBER && !expand && (
          <i
            className={`iconfont icon-shousuojiantou-zhankai ${styles.arrow}`}
            title="展开"
            onClick={() => setExpand(true)}
          />
        )
      }
      {
        users.length > INIT_USER_NUMBER && expand && (
          <i
            className={`iconfont icon-shousuojiantou-shouqi ${styles.arrow}`}
            title="收起"
            onClick={() => setExpand(false)}
          />
        )
      }
    </div>
  )
}

export default ApproveUserList
