import React from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import { Row, Col, Switch, Divider, message, Tag } from '@uyun/components'
import ItemTypes from './itemTypes'
import { inject, observer } from 'mobx-react'

const menuSource = {
  beginDrag (props) {
    return {
      id: props.id,
      index: props.index,
      parentIndex: props.parentIndex
    }
  },
  isDragging(props, monitor) {
    return monitor.getItem().id === props.id
  }
}

const menuTarget = {
  hover(props, monitor, component) {
    if (!component) {
      return null
    }
    const dragIndex = monitor.getItem().index
    const dragParentIndex = monitor.getItem().parentIndex
    const hoverIndex = props.index
    const hoverParentIndex = props.parentIndex
    // Don't replace items with themselves
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
    if (dragParentIndex <= hoverParentIndex && dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }
    // Dragging upwards
    if (dragParentIndex >= hoverParentIndex && dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }
    // Time to actually perform the action
    props.moveMenu(dragIndex, dragParentIndex, hoverIndex, hoverParentIndex)
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex
    monitor.getItem().parentIndex = hoverParentIndex
  }
}

@inject('listStore', 'queryerStore')
@observer
class MenuItem extends React.Component {
  onChange = (checked) => {
    const { index, onChangeChild } = this.props
    onChangeChild(checked, index)
  }

  edit = (menuItem) => {
    this.props.editItem(menuItem)
  }

  setHome = (id, name, status) => {
    // '首页修改成功，已经设定为“我所在部门的待办”'
    this.props.queryerStore.setDefaultHome(id).then(res => {
      if (res) {
        message.success(`${i18n('set_default_home_success', '首页修改成功，已经设定为“')}${name}${i18n('right_character', '”')}`)
        this.props.queryerStore.getMenuList()
      }
    })
    if (status !== 1) {
      this.onChange(1)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOver && !this.props.isOver) {
      this.props.sortMenu()
    }
  }

  render () {
    const {
      menuItem,
      isDragging,
      connectDragSource,
      connectDropTarget,
      _renderType,
      skin,
      deleteMenu
    } = this.props
    const { zhName, enName, status, menuType, iconName, defaultHome, id } = menuItem
    const opacity = isDragging ? 0.2 : 1
    const name = window.language === 'en_US' ? enName : zhName
    return connectDragSource(
      connectDropTarget(
        <div className="menu_style" style={{ opacity: opacity }} onClick={this.click}>
          <Row>
            <Col span={12} className="sub_menu_icon" >
              {name}
              {defaultHome === 1
                ? <Tag className="menu_tag">{i18n('home', '首页')}</Tag>
                : null}
              {
                defaultHome !== 1 && menuType !== 'GROUP' && menuType !== 'HYPERLINK'
                  ? <Tag className="set_home" onClick={() => { this.setHome(id, name, status) }}>{i18n('setHome', '设为首页')}</Tag>
                  : null
              }
            </Col>
            <Col span={3}>
              <i className={`iconfont  chapterIcon icon-${iconName || 'xingzhuangjiehe'}`} />
            </Col>
            <Col span={3}>{_renderType(menuItem)}</Col>
            <Col span={3}><Switch disabled={defaultHome === 1} checked={status === 1} onChange={this.onChange} /></Col>
            <Col span={3}>
              <a onClick={() => this.edit(menuItem)}>{i18n('edit', '编辑')}</a>
              <Divider type="vertical" />
              <a disabled={menuType === 'BUILT' || defaultHome === 1 || status === 1} onClick={() => { deleteMenu(menuItem) }}>{i18n('delete', '删除')}</a>
            </Col>
          </Row>
        </div>
      )
    )
  }
}

export default DropTarget(ItemTypes.menu, menuTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver()
}))(
  DragSource(ItemTypes.menu, menuSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))(MenuItem)
)