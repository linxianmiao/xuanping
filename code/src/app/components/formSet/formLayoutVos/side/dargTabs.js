import React from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import { findDOMNode } from 'react-dom'
import { Input, Button, Form, Tooltip, Divider } from '@uyun/components'
import { PlusOutlined, CopyOutlined, DragOutlined, DeleteOutlined } from '@uyun/icons'
import CopyInput from '../components/cpoyInput'

let dragingIndex = '-1'
let opacity = '1'
const FormItem = Form.Item

// 被拖拽
const CardSource = {
  // 开始被拖拽时触发
  beginDrag(props) {
    // 这里key是id
    dragingIndex = props.key
    return {
      index: props.index
    }
  },
  // 卡片结束拖拽时触发
  endDrag(props) {
    dragingIndex = '-1'
    opacity = '1'
    props.newRenderFn()
  }
}

const CardTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index

    if (dragIndex === hoverIndex) return null
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2
    const clientOffset = monitor.getClientOffset()
    const hoverClientX = clientOffset.x - hoverBoundingRect.left // 悬浮时鼠标距离目标源的左边距

    if (hoverIndex - dragIndex === 0 && hoverClientX < hoverMiddleX) {
      return null
    }
    if (dragIndex - hoverIndex === 0 && hoverClientX > hoverMiddleX) {
      return null
    }

    props.moveSort(dragIndex, hoverIndex)
    monitor.getItem().index = hoverIndex
  }
}

class CardItem extends React.Component {
  render() {
    const { connectDragSource, connectDropTarget, item, index, key, getFieldDecorator, length } =
      this.props
    opacity = key === dragingIndex ? '0.1' : '1'
    return connectDragSource(
      connectDropTarget(
        <div key={item.id} className="field-tabs-silder-tab-item" style={{ zIndex: '10' }}>
          <FormItem>
            {getFieldDecorator(item.id, {
              initialValue: item.name,
              rules: [
                {
                  required: true,
                  message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                    'ticket.relateTicket.title',
                    '标题'
                  )}`
                }
              ]
            })(
              <Input
                maxLength="32"
                placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                  'ticket.relateTicket.title',
                  '标题'
                )}`}
                prefix={
                  <Tooltip title={`${i18n('drag-to-sort', '拖动可排序')}`}>
                    <DragOutlined style={{ cursor: 'move' }} className="sort" />
                  </Tooltip>
                }
                addonAfter={
                  <>
                    <CopyInput id={item.id} />

                    {length !== 1 && (
                      <i
                        onClick={() => this.props.handleDelTab(index)}
                        className="iconfont icon-shanchu icon-fontSize"
                        style={{ marginLeft: 5 }}
                      />
                    )}
                  </>
                }
                onChange={() => {
                  this.props.newRenderFn()
                }}
              />
            )}
          </FormItem>
        </div>
      )
    )
  }
}

export default DragSource('sort', CardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(
  DropTarget('sort', CardTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }))(CardItem)
)
