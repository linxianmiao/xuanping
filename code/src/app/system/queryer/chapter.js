import React from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource, DropTarget } from 'react-dnd'
import ItemTypes from './itemTypes'
import { Row, Col, Switch, Divider, message, Tag } from '@uyun/components'
import MenuItem from './menuItem'
import AddItem from './addItem'
import { inject, observer } from 'mobx-react'

const chapterSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index
    }
  }
}

const chapterTarget = {
  hover(props, monitor, component) {
    if (!component) {
      return null
    }
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
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
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }
    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }
    // Time to actually perform the action
    props.moveChapter(dragIndex, hoverIndex)
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex
  }
}

@inject('listStore', 'queryerStore')
@observer
class Chapter extends React.Component {
  _renderType = (menuItem = {}) => {
    switch (menuItem.menuType) {
      case 'BUILT':
        return i18n('built', '内置')
      case 'HYPERLINK':
      case 'QUERYER':
        return i18n('global_queryer', '查询器')
      case 'GROUP':
        return i18n('classify', '分类')
    }
  }

  onChange = (checked) => {
    const { index, changeChecked } = this.props
    changeChecked(index, checked, null)
  }

  onChangeChild = (checked, childIndex) => {
    const { index, changeChecked } = this.props
    changeChecked(index, checked, childIndex)
  }

  edit = (menuItem) => {
    this.props.editItem(menuItem)
  }

  setHome = (id, name, status) => {
    // '首页修改成功，已经设定为“我所在部门的待办”'
    this.props.queryerStore.setDefaultHome(id).then((res) => {
      if (res) {
        message.success(
          `${i18n('set_default_home_success', '首页修改成功，已经设定为“')}${name}${i18n(
            'right_character',
            '”'
          )}`
        )
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

  render() {
    const {
      index,
      menuItem,
      moveMenu,
      isDragging,
      connectDragSource,
      connectDropTarget,
      editItem,
      sortMenu,
      skin,
      deleteMenu,
      appIsolation
    } = this.props
    const { zhName, enName, status, menuType, children, defaultHome, iconName, id } = menuItem
    const opacity = isDragging ? 0.2 : 1
    const name = window.language === 'en_US' ? enName : zhName
    return connectDragSource(
      connectDropTarget(
        <div className="container_style" style={{ opacity: opacity }}>
          <div className={menuType !== 'GROUP' ? 'chapter_style' : ' group_style'}>
            <Row>
              <Col span={12}>
                {name}
                {/* {defaultHome === 1 ? <div style={{ backgroundImage: `url(images/${skin}/${window.language}_home.png)` }} className="menu_tag" /> : null} */}
                {defaultHome === 1 && !appIsolation ? (
                  <Tag className="menu_tag">{i18n('home', '首页')}</Tag>
                ) : null}
                {defaultHome !== 1 &&
                menuType !== 'GROUP' &&
                menuType !== 'HYPERLINK' &&
                !appIsolation ? (
                  <Tag
                    className="set_home"
                    onClick={() => {
                      this.setHome(id, name, status)
                    }}
                  >
                    {i18n('setHome', '设为首页')}
                  </Tag>
                ) : null}
              </Col>
              <Col span={3}>
                <i className={`iconfont  chapterIcon icon-${iconName || 'xingzhuangjiehe'}`} />
              </Col>
              <Col span={3}>{this._renderType(menuItem)}</Col>
              <Col span={3}>
                {/* 分类不能设置展示 */}
                {menuType !== 'GROUP' ? (
                  <Switch
                    disabled={defaultHome === 1}
                    checked={status === 1}
                    onChange={this.onChange}
                  />
                ) : null}
              </Col>
              <Col span={3}>
                <a onClick={() => this.edit(menuItem)}>{i18n('edit', '编辑')}</a>
                <Divider type="vertical" />
                <a
                  disabled={
                    menuType === 'BUILT' ||
                    defaultHome === 1 ||
                    (menuType !== 'GROUP' && status === 1)
                  }
                  onClick={() => {
                    deleteMenu(menuItem)
                  }}
                >
                  {i18n('delete', '删除')}
                </a>
              </Col>
            </Row>
          </div>
          {children
            ? children.map((item, i) => (
                <MenuItem
                  skin={skin}
                  sortMenu={sortMenu}
                  key={`l_${item.id}`}
                  index={i}
                  parentIndex={index}
                  id={`l_${item.id}`}
                  menuItem={item}
                  editItem={editItem}
                  onChangeChild={this.onChangeChild}
                  _renderType={this._renderType}
                  deleteMenu={deleteMenu}
                  moveMenu={moveMenu}
                />
              ))
            : null}
          {/* 当一级菜单没有参数时，没有办法挪动二级菜单到一级菜单这里，所以加一个默认的item */}
          {menuType === 'GROUP' && children.length === 0 ? (
            <AddItem
              sortMenu={sortMenu}
              index={children ? children.length : 0}
              parentIndex={index}
              id={`l_${index}_add`}
              moveMenu={moveMenu}
            />
          ) : null}
        </div>
      )
    )
  }
}

export default DropTarget(ItemTypes.Chapter, chapterTarget, (connect, monitor) => ({
  isOver: monitor.isOver(),
  connectDropTarget: connect.dropTarget()
}))(
  DragSource(ItemTypes.Chapter, chapterSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))(Chapter)
)
