import React, { useState } from 'react'
import { Tooltip } from '@uyun/components'
import classnames from 'classnames'

const ModelCard = props => {
  const { data, onClick, onCollect, showFollow, selectList, mode } = props
  const { iconName, processName, fileId, fileName, isCollect, sharedBusinessUnitName, description, processId } = data
  const imgurl = `${API.DOWNLOAD}/${fileId}/${fileName}`

  const [collect, setCollect] = useState(isCollect)

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
      'mbt-model-card-heart': true,
      'icon-shoucang-shixin': collect === 1,
      'icon-shoucang-kongxin': collect === 0
    })

    return <i className={className} onClick={handleHeartClick} />
  }
  return (
    <div className="mbt-model-card">
      <Tooltip title={description || undefined}>
        <div className={classnames('mbt-model-card-content', {
          selected: _.some(selectList, item => item.processId === processId),
          isHover: mode === 'link'
        })} onClick={() => onClick(data)}>
          {iconName === 'define' ? <img src={imgurl} /> : <i className={`iconfont icon-${iconName}`} />}
          <span className="mbt-model-card-title" title={processName}>{processName}</span>
          {showFollow && renderCollect()}
          {
            !!sharedBusinessUnitName && (
              <Tooltip title={sharedBusinessUnitName}>
                <i className="iconfont icon-fenxiangjiaobiao" />
              </Tooltip>
            )
          }
        </div>
      </Tooltip>
    </div>
  )
}

export default ModelCard
