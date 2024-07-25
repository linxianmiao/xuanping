import React, { ReactElement } from 'react'
import { __ } from '@uyun/utils'

const Demo = (): ReactElement => {
  return <div>Hello {__('joe')}</div>
}

export default Demo
