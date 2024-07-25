import React, { Component } from 'react'
import Widgets from './widgets'
import Table from './table'

class BuiltinFieldList extends Component {
  render() {
    return (
      <div className="extend-list">
        <Widgets />
        <Table appkey={this.props.appkey} />
      </div>
    )
  }
}

export default BuiltinFieldList
