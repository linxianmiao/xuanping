import React from 'react'
import styles from './index.module.less'

/**
 * SLA和OLA的逾期状态
 */
const Status = ({
  name = '',
  color = ''
}) => {
  return (
    <span className={styles.status}>
      <i style={{ backgroundColor: color }} />
      {name}
    </span>
  )
}

export default Status
