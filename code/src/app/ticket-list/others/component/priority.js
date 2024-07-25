import React, { Component } from 'react'
import './style/priority.less'

class PriorityTd extends Component {
  render () {
    const { priority } = this.props
    const list = []
    for (let i = 1; i <= 5; i++) {
      if (i <= priority) {
        list.push(<i key={i} className="iconfont icon-shoucangshi" aria-hidden="true" />)
      } else {
        list.push(<i key={i} className="iconfont icon-shoucangkong" aria-hidden="true" />)
      }
    }
    return (
      <div className="ticket-list-priority">{list}</div>
    )
  }
}

export default PriorityTd
