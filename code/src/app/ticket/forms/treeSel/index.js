import React, { Component } from 'react'
import Normal from './Normal'
import Dictionary from './Dictionary'

export default class TreeSel extends Component {
  render() {
    const { tabStatus } = this.props.field

    if (tabStatus === '2') {
      return <Dictionary {...this.props} />
    }

    return <Normal {...this.props} />
  }
}
