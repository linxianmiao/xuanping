import React from 'react'
import { Button } from '@uyun/components'
import classnames from 'classnames'
import { DEFAULT_COLOR } from './factory'
import styles from './index.module.less'

const RadioButton = (props) => {
  const { children, value, isChooseColor, checked, color, style, onChange } = props

  const getButtonStyle = () => {
    if (isChooseColor && checked) {
      const backgroundColor = color || DEFAULT_COLOR
      return { backgroundColor, color: '#fff', border: '1px solid transparent', ...style }
    }
    return style
  }

  const className = classnames({
    [styles.btnChecked]: checked && !isChooseColor
  })

  return (
    <Button
      className={className}
      style={getButtonStyle()}
      onClick={() => onChange(`${value}`)}
      disabled={props.disabled}
    >
      {children}
    </Button>
  )
}

RadioButton.defaultProps = {
  isChooseColor: false,
  checked: false,
  value: undefined,
  color: '',
  style: {}
}

export default RadioButton
