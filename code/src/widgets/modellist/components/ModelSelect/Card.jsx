import React from 'react'
import { CheckOutlined } from '@uyun/icons';
import { Tooltip, Icon } from '@uyun/components'
import classnames from 'classnames'
import { API } from '../../api/request/config'
import styles from './index.module.less'

const ModelCard = props => {
  const { data, selected, onClick } = props
  const { iconName, processName, fileId, fileName, sharedBusinessUnitName } = data
  const imgurl = `${API}/file/downloadFile/${fileId}/${fileName}`

  const cardClassName = classnames({
    [styles.mbtModelCardContent]: true,
    [styles.selected]: !!selected
  })

  return (
    <div className={styles.mbtModelCard}>
      <div className={cardClassName} onClick={() => onClick(data)}>
        {iconName === 'define' ? <img src={imgurl} /> : <i className={`iconfont icon-${iconName}`} />}
        <span className={styles.mbtModelCardTitle}>{processName}</span>
        {
          !!sharedBusinessUnitName && (
            <Tooltip title={sharedBusinessUnitName}>
              <i className="iconfont icon-fenxiangjiaobiao" />
            </Tooltip>
          )
        }
        {
          !!selected && <CheckOutlined />
        }
      </div>
    </div>
  );
}

export default ModelCard
