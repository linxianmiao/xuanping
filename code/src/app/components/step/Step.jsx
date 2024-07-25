import React, { use } from 'react'
import { CheckOutlined, EditOutlined } from '@uyun/icons'

import './Step.less'

function Steps(props) {
  let classStr = 'step-wrap'
  if (props.items.length > 20) {
    classStr += ' scroll'
  }
  if (props.className) {
    classStr += ' ' + props.className
  }
  if (props.items.every((d) => d.status !== 'wait')) {
    classStr += ' finish' + props.className
  }

  return (
    <div className={classStr}>
      {_.map(props.items, (d, i) => {
        let className = 'step-item'
        switch (d.status) {
          case 'process':
            className = 'step-item process-item'
            break
          case 'wait':
            className = 'step-item wait-item'
            break
          case 'finish':
            className = 'step-item finish-item'
            break
          default:
            break
        }
        return (
          <div className={className} key={`steps-${i}`}>
            <div className="div-arrow" />
            {d.title}
          </div>
        )
      })}
    </div>
  )
}

export default Steps
