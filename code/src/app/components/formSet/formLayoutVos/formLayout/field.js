import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import { inject, observer } from 'mobx-react'
import { FILTER } from '../configuration'
import { renderField } from '~/ticket/forms/utils/renderField'
import classnames from 'classnames'
import Type from '../type'
import { message } from '@uyun/components'

const fieldSource = {
  beginDrag(props) {
    const { field, fieldIndex, layoutIndex, tabsIndex, parentType } = props
    props.handleSideShow(null, 'side')
    return {
      action: 'move',
      beginParentType: parentType,
      beginLayoutIndex: layoutIndex,
      beginTabsIndex: tabsIndex,
      beginFieldIndex: fieldIndex,
      id: field.id,
      type: field.type,
      beginField: field
    }
  },
  canDrag(props) {
    return props.canDrag
  }
}
const fieldTarget = {
  hover(props, monitor, component) {
    const item = monitor.getItem()
    const { beginFieldIndex, beginLayoutIndex, action, beginParentType } = item
    const { fieldIndex, layoutIndex, fieldList } = props
    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()
    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top
    if (action === 'move' && beginParentType !== 'layout') {
      const filter_index = _.findIndex(fieldList, (field) => field.id === FILTER.id)
      if (filter_index !== -1) {
        if (filter_index < fieldIndex && hoverClientY < hoverMiddleY) {
          return
        }
        if (filter_index > fieldIndex && hoverClientY > hoverMiddleY) {
          return
        }
        if (filter_index === fieldIndex) {
          return
        }
        props.movefield(filter_index, fieldIndex)
      } else {
        if (beginFieldIndex < fieldIndex && hoverClientY < hoverMiddleY) {
          return
        }
        if (beginFieldIndex > fieldIndex && hoverClientY > hoverMiddleY) {
          return
        }
        if (beginLayoutIndex === layoutIndex && beginFieldIndex !== fieldIndex) {
          props.movefield(beginFieldIndex, fieldIndex)
          monitor.getItem().beginFieldIndex = fieldIndex
        }
      }
    } else {
      const filter_index = _.findIndex(fieldList, (field) => field.id === FILTER.id)
      if (filter_index !== -1) {
        if (filter_index < fieldIndex && hoverClientY < hoverMiddleY) {
          return
        }
        if (filter_index > fieldIndex && hoverClientY > hoverMiddleY) {
          return
        }
        if (filter_index === fieldIndex) {
          return
        }
        props.movefield(filter_index, fieldIndex)
      }
    }
  }
}
@inject('formSetGridStore')
@DropTarget(Type, fieldTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  item: monitor.getItem(),
  canDrop: monitor.canDrop()
}))
@DragSource(Type, fieldSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
  canDrag: monitor.canDrag()
}))
@observer
class Field extends Component {
  // 选择类型
  switchType = (field, props) => {
    const { currentGrid } = this.props.formSetGridStore
    const { formLayoutType } = currentGrid
    const dilver = _.assign(
      {},
      props,
      { initialValue: props.field.defaultValue },
      { formLayoutType }
    )
    if (this.props.isDragging || field.type === 'filter_id') {
      return <div className="field-drag-tip">{i18n('formSet-drop-tip1', '请拖放到这里')}</div>
    }
    if (field.type === 'placeholder') {
      return <div className="field-placeholder">我是一个占位符,仅在配置时可见</div>
    }
    return renderField(field, dilver)
  }

  handleSideShow = (e, type) => {
    e.stopPropagation()
    const { layoutIndex, tabsIndex, fieldIndex, parentType, field } = this.props
    this.props.handleSideShow(
      {
        layoutIndex: layoutIndex,
        tabsIndex,
        fieldIndex,
        parentType,
        id: field.id
      },
      type
    )
  }

  handleDelFields = (e) => {
    e.stopPropagation()
    const { code } = this.props.field
    const { layoutIndex, tabsIndex, fieldIndex, parentType } = this.props
    this.props.handleSideShow(null, 'side')
    this.props.formSetGridStore.deleteField(layoutIndex, tabsIndex, fieldIndex, parentType, [code])
  }

  render() {
    const { field, connectDragSource, connectDropTarget, sideValue } = this.props
    const { type, id: fieldId, linkageStrategyVos } = field
    const { id } = sideValue || {}
    return connectDragSource(
      connectDropTarget(
        <div className="form-layout-field">
          <div
            className={classnames('mask', {
              active: fieldId === id
            })}
            onClick={(e) => {
              this.handleSideShow(e, 'side')
            }}
          >
            {fieldId === id && (
              <span>
                {!_.includes(['placeholder', 'iframe', 'sla', 'relateTicket'], type) &&
                  field.type !== 'ticketField' && (
                    <i
                      className={classnames('icon-guanlian iconfont', {
                        active: !_.isEmpty(linkageStrategyVos)
                      })}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (this.props.formSetGridStore.allFields.length > 0) {
                          this.handleSideShow(e, 'modal')
                        } else {
                          message.warning('稍等，加载中')
                        }
                      }}
                    />
                  )}
                <i className="icon-guanbi1 iconfont" onClick={this.handleDelFields} />
              </span>
            )}
          </div>
          {this.switchType(field, this.props)}
        </div>
      )
    )
  }
}

export default Field
