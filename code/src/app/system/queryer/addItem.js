import React from 'react'
import { DropTarget } from 'react-dnd'
import ItemTypes from './itemTypes'

const addItemTarget = {
  canDrop (props, monitor) {
    return props.parentIndex !== monitor.getItem().parentIndex && props.index === 0
  },
  drop (props, monitor) {
    const dragIndex = monitor.getItem().index
    const dragParentIndex = monitor.getItem().parentIndex
    const hoverIndex = props.index
    const hoverParentIndex = props.parentIndex
    if (dragParentIndex === hoverParentIndex && dragIndex === hoverIndex) {
      return
    }
    props.moveMenu(dragIndex, dragParentIndex, hoverIndex, hoverParentIndex)
    monitor.getItem().index = hoverIndex
    monitor.getItem().parentIndex = hoverParentIndex
  }
}

class AddItem extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.isOver && !this.props.isOver) {
      this.props.sortMenu()
    }
  }

  render () {
    const {
      children,
      isOver,
      // isCanDrop,
      connectDropTarget
    } = this.props
    return connectDropTarget(
      <div className={isOver ? 'insert add_item_style' : 'add_item_style'}>{ children }</div>
    )
  }
}

export default DropTarget(ItemTypes.menu, addItemTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  isCanDrop: monitor.canDrop()
}))(AddItem)