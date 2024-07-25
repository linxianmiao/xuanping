import React from 'react'
import { DEFAULT_COLOR } from './factory'

const Text = props => {
  const { isChooseColor, color, style, children } = props

  const getSpanStyle = () => {
    if (isChooseColor) {
      const backgroundColor = color || DEFAULT_COLOR
      return {
        backgroundColor,
        color: '#fff',
        padding: 8,
        borderRadius: 2,
        ...style
      }
    }

    return style
  }

  return (
    <span style={getSpanStyle()}>{children}</span>
  )
}

Text.defaultProps = {
  isChooseColor: false,
  color: undefined,
  style: {}
}

export default Text
