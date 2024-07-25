import React, { Component } from 'react'
import AppTodoList from '@uyun/biz-itsm-appTodoList'

class AppTodoListWrap extends Component {
  render() {
    return (
      <div style={{ margin: 20 }}>
        <AppTodoList appkey={this.props.match.params.appkey} />
      </div>
    )
  }
}

export default AppTodoListWrap
