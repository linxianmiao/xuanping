import React, { useState, useMemo } from 'react'
import { Dropdown, Button, Checkbox } from '@uyun/components'
import { CHANFE_FIELD_TYPE } from '../../configuration'
import styles from './index.module.less'

const Select = (props) => {
  const [visible, setVisible] = useState(false)

  const changeFieldType = useMemo(() => {
    return new Set(CHANFE_FIELD_TYPE)
  }, [])

  const overlay = () => {
    const { options, value, onChange, fieldType, linkSource } = props

    const nextOptions = options.map((option) => {
      let disabled = false
      //纵向分组的联动策略只支持显隐，别的不支持
      if (
        linkSource === 'group' &&
        ['changeValue', 'asyncValue', 'timeValidate', 'checkIn'].includes(option.value)
      ) {
        disabled = true
      }
      // 值变动 和 动态值 互斥
      if (option.value === 'changeValue' && value.includes('asyncValue')) {
        disabled = true
      }
      if (option.value === 'asyncValue' && value.includes('changeValue')) {
        disabled = true
      }
      if (['asyncValue', 'changeValue'].includes(option.value) && !changeFieldType.has(fieldType)) {
        disabled = true
      }
      // 时间校验只针对时间类型字段
      if (option.value === 'timeValidate' && fieldType !== 'dateTime') {
        disabled = true
      }
      return { ...option, disabled }
    })

    return (
      <div className={styles.overlay}>
        <Checkbox.Group options={nextOptions} value={value} onChange={onChange} />
      </div>
    )
  }

  const { value } = props

  return (
    <Dropdown overlay={overlay()} visible={visible} onVisibleChange={(v) => setVisible(v)}>
      <Button type="primary">
        {i18n('set.number.options', '设置({number})项', { number: value.length + '' })}
      </Button>
    </Dropdown>
  )
}

Select.defaultProps = {
  options: [],
  value: [],
  onChange: () => {}
}

export default Select
