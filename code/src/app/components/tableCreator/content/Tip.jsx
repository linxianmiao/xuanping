import React from 'react'
import { Tooltip, Icon } from '@uyun/components'

const Tip = props => {
  const { icon, style, className, ...rest } = props

  return (
    <Tooltip {...rest}>
      <Icon type={icon || 'question-circle'} className={`tip-icon ${className}`} style={style} />
    </Tooltip>
  )
}

export default Tip