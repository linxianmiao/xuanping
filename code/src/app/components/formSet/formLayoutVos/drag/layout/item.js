import React, { Component } from 'react'
import { DragSource } from 'react-dnd'
import Type from '../../type'
import uuid from '~/utils/uuid'

const fieldSource = {
  beginDrag (props) {
    const data = _.chain(props.item).omit(['icon']).cloneDeep().value()
    // 标签页里的标签也要加id
    if (data.type === 'tab') {
      return _.assign({ }, data, {
        id: uuid(),
        tabs: [{
          id: uuid(),
          fieldList: [],
          name: i18n('model.field.tab', '标签页')
        }]
      })
    } else {
      return _.assign({}, data, {
        id: uuid()
      })
    }
  }
}

@DragSource(Type, fieldSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class Item extends Component {
  render () {
    const { connectDragSource } = this.props
    const { name, icon } = this.props.item
    return (
      connectDragSource(
        <li className="shenglue" title={name}><i className={`${icon} iconfont`} />{name}</li>
      )
    )
  }
}

export default Item
