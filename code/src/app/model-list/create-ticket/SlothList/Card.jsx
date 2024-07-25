import React, { useState } from 'react'
import { Tooltip } from '@uyun/components'
import classnames from 'classnames'
import styles from './index.module.less'

const Card = props => {
  const { data, selectList, mode, showFollow, onClick, onCollect } = props
  const [collect, setCollect] = useState(data.isCollect)

  const handleHeartClick = e => {
    e.stopPropagation()

    const nextCollect = collect === 1 ? 0 : 1
    onCollect(nextCollect, data).then(res => {
      if (res) {
        setCollect(nextCollect)
      }
    })
  }

  const renderCollect = () => {
    const className = classnames({
      iconfont: true,
      heart: true,
      'icon-shoucang-shixin': collect === 1,
      'icon-shoucang-kongxin': collect === 0
    })

    return <i className={className} onClick={handleHeartClick} />
  }

  const contentClsName = classnames(styles.cardContent, {
    selected: selectList.some(item => item.id === data.id),
    isHover: mode === 'link'
  })

  return (
    <div className={styles.card}>
      <Tooltip title={data.description}>
        <div className={contentClsName} onClick={() => onClick(data)}>
          {data.icon_url === 'define' && data.icon_file_id ? (
            <img
              width={28}
              height={28}
              src={`/itsm/api/v2/srv_items/downloadFile/${data.icon_file_id}/${data.icon_file_name}`}
              alt=""
            />
          ) : (
            <i className={'iconfont icon-' + data.icon_url} />
          )}
          <span className="title" title={data.name}>
            {data.name}
          </span>
          {showFollow && renderCollect()}
        </div>
      </Tooltip>
    </div>
  )
}

Card.defaultProps = {
  data: {},
  selectList: [],
  mode: 'link',
  showFollow: true,
  onClick: () => {},
  onCollect: () => {}
}

export default Card
