import React, { useState, useEffect, useCallback } from 'react'
import { Popover } from '@uyun/components'
import Form from './Form'
import moment from 'moment'
import { getWeekDayLabel, getMonthAndDayLabel, getIntervalUnitList } from '../../constant'
import styles from './index.module.less'

const TimeStrategy = ({
  value,
  onChange
}) => {
  const [visible, setVisible] = useState(false)
  const [tip1, setTip1] = useState('请设置时间策略')
  const [tip2, setTip2] = useState('')

  const setTips = useCallback(value => {
    const {
      executeType,
      executeTime,
      executeDayOfWeek,
      executeMonth,
      executeDayOfMonth,
      timeInterval,
      intervalUnit 
    } = value

    if (!executeTime) {
      return
    }

    let t1 = ''
    let t2 = ''

    const time = moment(executeTime).format('HH:mm')

    if (executeType === '1') {
      t1 = `${time} 触发`
      t2 = '每天 重复'
    } else if (executeType === '2') {
      const days = (executeDayOfWeek ? executeDayOfWeek.split(',') : [])
        .map(item => getWeekDayLabel(item))
        .filter(Boolean)
        .join(' ')
      t1 = `${time} 触发`
      t2 = `${days} 重复`
    } else if (executeType === '3') {
      t1 = `${time} 触发`
      t2 = `${getMonthAndDayLabel(executeMonth, executeDayOfMonth)} 重复`
    } else if (executeType === '4') {
      t1 = `${time} 开始触发`
      t2 = `每隔${timeInterval}${getIntervalUnitList(intervalUnit)} 触发`
    } else if (executeType === '5') {
      t1 = `${moment(executeTime).format('YYYY/MM/DD HH:mm')} 触发`
    }

    setTip1(t1)
    setTip2(t2)
  }, [])

  const handleSubmit = value => {
    setVisible(false)
    onChange(value)
  }

  useEffect(() => {
    setTips(value)
  }, [value])

  const Content = (
    <Form
      value={value}
      onSubmit={handleSubmit}
    />
  )

  return (
    <Popover
      placement="bottomLeft"
      trigger="click"
      overlayStyle={{ width: 480 }}
      visible={visible}
      content={Content}
      onVisibleChange={setVisible}
    >
      <div className={styles.box}>
        <p>{tip1}</p>
        <p>{tip2}</p>
        <i className={styles.arrowDown} />
      </div>
    </Popover>
  )
}

TimeStrategy.defaultProps = {
  value: {},
  onChange: () => {}
}

export default TimeStrategy
