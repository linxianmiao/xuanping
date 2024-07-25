import React from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import { Tag } from '@uyun/components'

const columnSource = {
  beginDrag (props) {
    return {
      code: props.code,
      index: props.index
    }
  }
}

const columnTarget = {
  drop(props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index
    if (dragIndex === hoverIndex) {
      return
    }
    props.handleMoveColumn(dragIndex, hoverIndex)
  }
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
  //   props.handleMoveColumn(dragIndex, hoverIndex)
  //   monitor.getItem().index = hoverIndex
  // }
}

class DragColumn extends React.Component {
  render () {
    const {
      name,
      code,
      closeTag,
      connectDragSource,
      connectDropTarget
    } = this.props
    return (
      <div key={code} style={{ display: 'inline-block' }}>
        <Tag
          className="queryer_tag"
          // onClose={e => { closeTag(e, code) }}
        >{name}</Tag>
      </div>
    )
    // return connectDragSource(
    //   connectDropTarget(
    //     <div key={code} style={{ display: 'inline-block' }}>
    //       <Tag
    //         className="queryer_tag"
    //         closable={code !== 'ticketName'}
    //         onClose={e => { closeTag(e, code) }}
    //       >{name}</Tag>
    //     </div>

    //   )
    // )
  }
}

export default DropTarget('DragColumn', columnTarget, (connect, monitor) => ({
  isOver: monitor.isOver(),
  connectDropTarget: connect.dropTarget()
}))(
  DragSource('DragColumn', columnSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))(DragColumn)
)