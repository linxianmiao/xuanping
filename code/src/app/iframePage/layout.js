import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import stores from '~/stores'

export default class LayoutWarp extends Component {
  render() {
    const { children } = this.props
    return (
      <Provider {...stores}>
        <div style={{ overflowY: 'auto' }} className="content-wrap">
          {children}
        </div>
      </Provider>
    )
  }
}
