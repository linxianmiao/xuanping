import React from 'react'
import BlockPicker from 'react-color/es/Block'

import { allColor } from './logic'

const ColorPicker = (props) => {
  const { color, colors, triangle, onChange } = props
  return (
    <BlockPicker
      color={color}
      colors={colors}
      triangle={triangle}
      onChange={({ hex }) => onChange(hex)}
    />
  )
}

ColorPicker.defaultProps = {
  color: allColor[5], // 默认第6个颜色
  colors: allColor.slice(0, 10), // 默认获取前十个个颜色
  triangle: 'hide',
  onChange: () => {}
}

export default ColorPicker
