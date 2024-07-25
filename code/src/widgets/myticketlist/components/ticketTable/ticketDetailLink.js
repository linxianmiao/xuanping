import React, { Component } from 'react'

class TicketDetailLink extends Component {
  render() {
    const { record = {}, children } = this.props
    return (
      <a
        onClick={() => {
          this.props.handleDetailTicket(record, 'detail')
        }}
      >
        {children}
      </a>
    )
  }
}

export default TicketDetailLink
