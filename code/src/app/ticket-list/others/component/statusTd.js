import React, { Component } from 'react'
import { getStatusColor } from './common/util'
import './style/status.less'

class StatusTd extends Component {
  render () {
    const { name, color } = getStatusColor(this.props.status)
    return (
      <div>
        <i style={{ background: color }} className="ticket-list-status" />
        {name}
      </div>
    )
  }
}

export default StatusTd
