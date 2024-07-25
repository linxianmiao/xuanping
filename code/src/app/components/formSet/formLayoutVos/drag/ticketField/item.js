import React, { Component } from 'react'
import { DragSource } from 'react-dnd'
import classnames from 'classnames'
import { EXCLUSIVE_FIELD, REQUIRE_FIELD_CODE, AEAD_ONLY_FIELD_CODE } from '../../configuration'
import Type from '../../type'

const fieldSource = {
  beginDrag(props) {
    const fieldLayoutMul = props.item.type === 'multiRowText' ? 24 : 12
    const item = _.assign({}, props.item, {
      fieldLayout: { col: fieldLayoutMul },
      fieldLabelLayout: props.formLayoutType ? 'horizontal' : 'vertical',
      isRequired: 0
    })
    // 部分字段只能独占一行
    if (item.code === 'currentStage') {
      item.fieldLayout = { col: 24 }
    }

    return item
  },
  canDrag(props) {
    return props.canDrag
  }
}

@DragSource(Type, fieldSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class LeftItem extends Component {
  // 部分内置字段没有icon，特殊判断
  // NH的定制字段，特殊判断

  render() {
    const { connectDragSource, canDrag } = this.props
    const { name, code, iconName } = this.props.item
    return connectDragSource(
      <li
        className={classnames('list-item shenglue', {
          disabled: !canDrag
        })}
        title={name}
      >
        <i className={iconName} />
        {name}
      </li>
    )
  }
}

export default LeftItem
