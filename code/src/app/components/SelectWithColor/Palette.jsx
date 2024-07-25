import React from 'react'
import { Dropdown } from '@uyun/components'
import ColorPicker from '~/components/ColorPicker'
import { allColor } from '~/components/ColorPicker/logic'
import styles from './index.module.less'

const defaultColor = allColor[5]

const Palette = props => {
  const { value, color, style, disabled, fieldData, onChange } = props
  let bgColor = ''
  // 优先级特殊处理, 如果优先级没有颜色，需对应到前端给定的优先级颜色
  if (fieldData.code === 'urgentLevel') {
    bgColor = color || allColor[value - 1] || defaultColor
  } else {
    bgColor = color || defaultColor
  }

  const DisabledMask = <i className={styles.mask + ' iconfont icon-jingyong2'} />

  const renderContent = () => {
    return <ColorPicker color={bgColor} onChange={color => onChange(color)} />
  }

  return (
    <Dropdown overlay={renderContent()} disabled={disabled}>
      <i
        className={styles.colorView}
        style={{ ...style, backgroundColor: disabled ? '' : bgColor }}
      >
        {disabled && DisabledMask}
      </i>
    </Dropdown>
  )
}

Palette.defaultProps = {
  style: {},
  color: '', // 颜色值
  value: '', // 选项值
  disabled: false, // 是否开启颜色设置
  onChange: () => {},
  fieldData: {}
}

export default Palette
