import React from 'react'
import { Radio as URadio } from '@uyun/components'
import { DEFAULT_COLOR } from './factory'
import styles from './index.module.less'

const Radio = props => {
  const { color, isChooseColor, checked, children, value } = props

  const getSpanStyle = () => {
    if (isChooseColor && checked) {
      const backgroundColor = color || DEFAULT_COLOR
      return { backgroundColor, color: '#fff' }
    }
    return {}
  }

  return (
    <URadio value={value} checked={checked}>
      <span
        className={styles.radioSpan}
        style={getSpanStyle()}
      >
        {children}
      </span>
    </URadio>
  )
}

Radio.defaultProps = {
  isChooseColor: false,
  color: '',
  value: undefined,
  checked: false
}

export default Radio
