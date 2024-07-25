import React, { Component } from 'react'
import './styles/tab.less'
class Tab extends Component {
  render () {
    return (
      <div className="ticket-service-tab">
        <h3 className="title">{this.props.title}</h3>
        {this.props.children}
      </div>
    )
  }
}
export default Tab
