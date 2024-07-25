import React, { useState, useEffect } from 'react'
import { LeftSquareOutlined, RightSquareOutlined } from '@uyun/icons'
import { Tooltip, Icon } from '@uyun/components'
import TacheInfo from './TacheInfo'
import styles from './index.module.less'

/**
 * 当前环节名称
 * 包含上一个和下一个环节信息
 */
const CurrentTache = (props) => {
  const [data, setData] = useState([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    setData([])
  }, [props.params.ticketId])

  const handleQuery = () => {
    const { params } = props

    setFetching(true)

    axios.get(API.getTicketPrevAndNextTache, { params }).then((res) => {
      if (res && res.length > 0) {
        setData(res)
        setFetching(false)
      }
    })
  }

  const handleVisibleChange = (visible) => {
    if (visible && !fetching && data.length === 0) {
      handleQuery()
    }
  }

  const { name, type } = props
  const tooltipProps = (n) => ({
    overlayClassName: 'detail-prev-next-tache-tip',
    placement: 'bottom',
    title: <TacheInfo data={data[n]} loading={fetching} />,
    onVisibleChange: handleVisibleChange
  })

  return (
    <div className={styles.wrapper}>
      {!!type && type !== 'StartNoneEvent' && (
        <Tooltip {...tooltipProps(0)}>
          <LeftSquareOutlined />
        </Tooltip>
      )}
      <Tooltip placement="topLeft" title={name}>
        <p>{name}</p>
      </Tooltip>
      {!!type && type !== 'EndNoneEvent' && (
        <Tooltip {...tooltipProps(1)}>
          <RightSquareOutlined />
        </Tooltip>
      )}
    </div>
  )
}

CurrentTache.defaultProps = {
  name: '',
  type: '', // 节点类型，包括StartNoneEvent、EndNoneEvent、UserTask等
  params: {} // 接口需要的参数
}

export default CurrentTache
