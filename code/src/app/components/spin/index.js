import React from 'react'
import { Spin } from '@uyun/components'
import styles from './index.module.less'
function SpinCenter () {
  return (
    <div className={styles.spinCenterBox}>
      <Spin />
    </div>
  )
}

export default SpinCenter