import React, { Component } from 'react'
import Appticketlist from '@uyun/biz-itsm-appticketlist'

class AppTicketList extends Component {
  render() {
    return <Appticketlist appkey={this.props.match.params.appkey} />
  }
}

export default AppTicketList
