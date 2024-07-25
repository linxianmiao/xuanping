import React, { Component } from 'react'
import { Tooltip } from '@uyun/components'
import { getSLATime, hexToRgb } from './common/util'
import { Circle, Line } from 'rc-progress'

function getMessage (record) {
  const title = record.overdue === 'true' ? i18n('ticket.list.overdue', '已逾期：') : i18n('ticket.list.residue', '即将逾期:')

  const trailColor = record.overdue === 'true'
    ? record.color ? record.color : '#FFAE2F' : record.color ? record.color : '#2DB7F5'

  return {
    title,
    trailColor
  }
}
class SLA extends Component {
    getCircle = record => {
      const { title, trailColor } = getMessage(record)
      return (
        <Tooltip placement="topLeft" title={`${title}${getSLATime(record.overdueTime)}`}>
          <div style={{ cursor: 'pointer', marginTop: '3px', width: '14px', height: '14px' }}>
            <Circle
              percent={record.percent}
              strokeWidth="18"
              trailWidth="18"
              strokeColor={trailColor}
              trailColor={hexToRgb(trailColor)}
            />
          </div>
        </Tooltip>
      )
    }

    getLine = record => {
      const { title, trailColor } = getMessage(record)

      return (
        <Tooltip placement="topLeft" title={`${title}${getSLATime(record.overdueTime)}`}>
          <div style={{ cursor: 'pointer', marginTop: '3px', width: '112px' }}>
            <Line
              percent={record.percent}
              strokeWidth="5"
              trailWidth="5"
              strokeColor={trailColor}
              trailColor={hexToRgb(trailColor)}
            />
          </div>
        </Tooltip>
      )
    }

    render () {
      const { record, type } = this.props
      return (
        <div className={`sla-${type}`}>
          {type === 'line' && this.getLine(record)}
          {type === 'circle' && this.getCircle(record)}
        </div>
      )
    }
}

export default SLA
