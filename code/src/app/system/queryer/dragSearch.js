import React from 'react'
import { DragSource, DropTarget } from 'react-dnd'

const columnSource = {
  beginDrag (props) {
    return {
      id: props.item.code,
      index: props.index
    }
  }
}

const columnTarget = {
//   drop(props, monitor, component) {
//     const dragIndex = monitor.getItem().index
//     const hoverIndex = props.index
//     if (dragIndex === hoverIndex) {
//       return
//     }
//     props.handleMoveFilter(dragIndex, hoverIndex)
//   }
  // hover(props, monitor, component) {
  //   if (!component) {
  //     return null
  //   }
  //   const dragIndex = monitor.getItem().index
  //   const hoverIndex = props.index
  //   // Don't replace items with themselves
  //   if (dragIndex === hoverIndex) {
  //     return
  //   }
  //   props.handleMoveFilter(dragIndex, hoverIndex)
  //   monitor.getItem().index = hoverIndex
  // }
  drop(props, monitor, component) {
    if (!component) {
      return null
    }
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }
    props.handleMoveFilter(dragIndex, hoverIndex)
    monitor.getItem().index = hoverIndex
  }
}

class DragSearch extends React.Component {
  render () {
    const {
      type,
      index,
      isDragging,
      connectDragSource,
      connectDropTarget
    } = this.props
    const opacity = isDragging ? 0.2 : 1
    return (
      <div style={{ opacity, width: '25%', display: 'inline-block', padding: '0 8px', verticalAlign: 'top', cursor: 'pointer' }} key={index}>
          {type}
        </div>
    )
  }
}

export default DropTarget('DragSearch', columnTarget, (connect, monitor) => ({
  isOver: monitor.isOver(),
  connectDropTarget: connect.dropTarget()
}))(
  DragSource('DragSearch', columnSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))(DragSearch)
)