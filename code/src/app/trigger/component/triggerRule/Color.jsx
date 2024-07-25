import React from 'react'
import { Dropdown } from '@uyun/components'
import ColorPicker from '~/components/ColorPicker'
import colorList from '~/create-policy/config/actionColorList'

const Color = ({
  value = '#ff0000',
  onChange = () => {}
}) => {
  const renderSelect = () => {
    return (
      <ColorPicker
        color={value}
        colors={colorList}
        onChange={color => onChange(color)}
      />
    )
  }

  return (
    <Dropdown overlay={renderSelect()} trigger={['click']}>
      <div style={{ width: 32, height: 32, cursor: 'pointer', background: value }} />
    </Dropdown>
  )
}

export default Color
