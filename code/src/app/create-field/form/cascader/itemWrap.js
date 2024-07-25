import React, { Component } from 'react'
import Item from './item'

class ItemWrap extends Component {
  render () {
    return <div className="options-item-wrap">
      <Item {...this.props} />
    </div>
  }
}

export default ItemWrap
