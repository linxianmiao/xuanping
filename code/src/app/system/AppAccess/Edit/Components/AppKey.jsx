import React, { Component } from 'react'
import { Tooltip } from '@uyun/components'
import CopyIcon from '~/components/CopyIcon'
import uuid from '~/utils/uuid'
import styles from './index.module.less'

export default class AppKey extends Component {
  static defaultProps = {
    onChange: () => {}
  }

  render() {
    const { value, onChange } = this.props

    return (
      <div className={styles.appkey}>
        <span>{value}</span>
        <CopyIcon style={{ marginLeft: 8 }} value={value} />
        {/* <Tooltip title={i18n('globe.reset', '重置')}>
          <i
            className="iconfont icon-shuaxin"
            style={{ marginLeft: 8 }}
            onClick={() => onChange(uuid())}
          />
        </Tooltip> */}
      </div>
    )
  }
}
