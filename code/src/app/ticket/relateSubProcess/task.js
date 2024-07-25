import React from 'react'
import { Button, Row, Col, Tag, Popconfirm } from '@uyun/components'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import { HolderOutlined } from '@uyun/icons'

const chapterSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
      parentIndex: props.parentIndex
    }
  }
}

const chapterTarget = {
  hover(props, monitor, component) {
    if (!component) {
      return null
    }
    const dragIndex = monitor.getItem().index
    const dragParentIndex = monitor.getItem().parentIndex
    const hoverIndex = props.index
    const hoverParentIndex = props.parentIndex
    // Don't replace items with themselves
    const dragId = monitor.getItem().id
    const hoverId = props.id
    if (dragParentIndex === hoverParentIndex && dragIndex === hoverIndex) {
      return
    }
    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()
    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    // Determine mouse position
    const clientOffset = monitor.getClientOffset()
    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top
    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%
    // Dragging downwards
    if (
      dragParentIndex <= hoverParentIndex &&
      dragIndex < hoverIndex &&
      hoverClientY < hoverMiddleY
    ) {
      return
    }
    // Dragging upwards
    if (
      dragParentIndex >= hoverParentIndex &&
      dragIndex > hoverIndex &&
      hoverClientY > hoverMiddleY
    ) {
      return
    }
    console.log('moveTask')
    // Time to actually perform the action
    props.moveTaskChild(dragIndex, dragParentIndex, hoverIndex, hoverParentIndex)
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex
    monitor.getItem().parentIndex = hoverParentIndex
  }
}

class Task extends React.Component {
  linkToDetail = (data) => {
    const { setDetailDrawer, showCreateSubTicketDrawer, data: parentData } = this.props
    if (data.taskDraftStatus === 1) {
      const subRoute = {
        location: {
          pathname: `/ticket/detail/${data.taskTicketId}`,
          search: `?tacheType=0&tacheNo=0&modelId=${data.taskModelId}&renderPager=false`
        },
        match: {
          params: { id: data.taskTicketId }
        }
      }
      setDetailDrawer(data.taskName, subRoute)
      // this.props.history.push(`/ticket/detail/${data.taskTicketId}`)
    } else {
      showCreateSubTicketDrawer(parentData, data.taskTicketId)
      // this.props.history.push(`/ticket/drafts/${data.taskTicketId}`)
    }
  }

  renderRow = (d) => {
    const { data } = this.props
    if (d.fieldCode === 'taskTicketNum' || d.fieldCode === 'taskName') {
      return (
        <div className="link-div">
          <a onClick={() => this.linkToDetail(data)}>{data[d.fieldCode]}</a>
        </div>
      )
    }
    if (d.fieldCode === 'taskOrder') {
      return ''
    }
    if (d.fieldType === 'ticket') {
      const value = data.formData[d.fieldCode]
      //字典下拉多选的情况
      if (Array.isArray(value) && _.has(value[0], 'label')) {
        let valueStr = _.map(value, (d) => d.label).join(',')
        return <div>{valueStr}</div>
      } else if (Array.isArray(value)) {
        return value.join(',')
      }
      //一般是下拉单选的情况
      if (Object.prototype.toString.call(value) === '[object Object]') {
        return value.label
      }
      return <div>{value}</div>
    }
    return <div>{data[d.fieldCode]}</div>
  }

  delTask = (data) => {
    const { parentData, delSubTask } = this.props
    if (parentData.children.length > 1) {
      delSubTask(data.id)
    } else {
      delSubTask(data.id, parentData.id)
    }
  }

  render() {
    const {
      data,
      isDragging,
      connectDragSource,
      connectDropTarget,
      columnList,
      index,
      disabled,
      scroll,
      parentNumber,
      parentData,
      curlevel
    } = this.props
    const { allowOperateDelete } = data
    let number =
      parentData?.groupType === 'serial' ? `${parentNumber}.${index + 1}` : `${parentNumber}`
    let paddingL = 0
    if (curlevel !== 1) {
      paddingL += 15 * (curlevel - 1)
    }
    return connectDragSource(
      connectDropTarget(
        <div style={{ opacity: isDragging ? 0.2 : 1 }}>
          <div className={scroll ? 'sub-task-body scroll' : 'sub-task-body'}>
            <div className="space">
              <HolderOutlined />
            </div>
            <div className="order" style={{ paddingLeft: paddingL }}>
              <span className={curlevel === 1 ? '' : 'parallel-icon2'}>{number}</span>
            </div>
            <div className="custom-columns">{_.map(columnList, (d) => this.renderRow(d))}</div>
            <div className="operation-subtask">
              <Popconfirm
                disabled={disabled || !allowOperateDelete}
                title={i18n('app.delete.content')}
                onConfirm={() => this.delTask(data)}
              >
                <a disabled={disabled || !allowOperateDelete}>{i18n('delete')}</a>
              </Popconfirm>
            </div>
          </div>
        </div>
      )
    )
  }
}

export default DropTarget('task', chapterTarget, (connect, monitor) => ({
  isOver: monitor.isOver(),
  connectDropTarget: connect.dropTarget()
}))(
  DragSource('task', chapterSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))(Task)
)
