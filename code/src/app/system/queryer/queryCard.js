import React, { Component } from 'react'
import { Row, Col, message, Modal } from '@uyun/components'
import update from 'immutability-helper'
import { inject, observer } from 'mobx-react'
import { getCookie } from '../../utils'
import { toJS } from 'mobx'
import Chapter from './chapter'
const skin = getCookie('skin') || 'white'
const confirm = Modal.confirm
@inject('listStore', 'queryerStore', 'globalStore')
@observer
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false, // 编辑
      skin: skin
    }
  }

  componentDidMount() {
    this.props.globalStore.getTicketPriority()

    window.changeSkin_hook_pending_distributed = () => {
      const skin = document.querySelector('html').classList.contains('blue') ? 'blue' : 'white'
      this.setState({
        skin: skin
      })
    }
  }

  componentWillUnmount() {
    window.changeSkin_hook_pending_distributed = () => {}
  }

  handleMoveChapter = (dragIndex, hoverIndex) => {
    const data = toJS(this.props.queryerStore.listData)
    const dragItem = data[dragIndex]
    const newData = update(data, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragItem]
      ]
    })
    this.props.queryerStore.setData(newData)
  }

  handleMoveMenu = (dragIndex, dragParentIndex, hoverIndex, hoverParentIndex) => {
    const data = toJS(this.props.queryerStore.listData)
    const dragItem = data[dragParentIndex].children[dragIndex]
    const dragData = update(data, {
      [dragParentIndex]: {
        children: { $splice: [[dragIndex, 1]] }
      }
    })
    const dropData = update(dragData, {
      [hoverParentIndex]: {
        children: { $splice: [[hoverIndex, 0, dragItem]] }
      }
    })
    this.props.queryerStore.setData(dropData)
  }

  changeChecked = (index, check, childIndex) => {
    // const { data } = this.state
    const data = toJS(this.props.queryerStore.listData)
    const status = check ? 1 : 0
    const id = childIndex === null ? data[index].id : data[index].children[childIndex].id
    const newData =
      childIndex === null
        ? update(data, {
            [index]: {
              status: { $set: status }
            }
          })
        : update(data, {
            [index]: {
              children: {
                [childIndex]: {
                  status: { $set: status }
                }
              }
            }
          })
    this.props.queryerStore.setData(newData)
    this.props.queryerStore.menuChangeStatus({ id: id, status })
  }

  sortMenu = () => {
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.props.queryerStore.sortMenu()
    }, 1000)
  }

  deleteMenu = (menuItem) => {
    const name = window.language === 'en_US' ? menuItem.enName : menuItem.zhName
    const type =
      menuItem.menuType === 'GROUP' ? i18n('classify', '分类') : i18n('global_queryer', '查询器')
    confirm({
      title: `${i18n('queryer.delete.tips', '你确定要删除')}${type}${name}${i18n(
        'queryer.delete.tips1',
        '吗？'
      )}`,
      content: i18n('queryer.delete.content', '删除后，数据将无法恢复'),
      okType: 'danger',
      onOk: () => {
        this.props.queryerStore.batchDelete({ menuIds: [menuItem.id] }).then((res) => {
          if (res === '200') {
            message.success(i18n('delete_success', '删除成功'))
            this.props.queryerStore.getMenuList()
          }
        })
      },
      onCancel() {}
    })
  }

  render() {
    const listData = toJS(this.props.queryerStore.listData)
    return (
      <div className="list_wrap">
        <Row className="list_title">
          <Col span={12}>{i18n('name', '名称')}</Col>
          <Col span={3}>{i18n('picture', '图片')}</Col>
          <Col span={3}>{i18n('ticket.create.type', '类型')}</Col>
          <Col span={3}>{i18n('dafault.display', '默认显示')}</Col>
          <Col span={3}>{i18n('operation', '操作')}</Col>
        </Row>
        {_.map(listData, (item, i) => (
          <Chapter
            skin={this.state.skin}
            key={item.id}
            index={i}
            id={item.id}
            menuItem={item}
            sortMenu={this.sortMenu}
            getList={this.props.getList}
            editItem={this.props.editItem}
            changeChecked={this.changeChecked}
            moveChapter={this.handleMoveChapter}
            deleteMenu={this.deleteMenu}
            moveMenu={this.handleMoveMenu}
            appIsolation={this.props.appIsolation}
          />
        ))}
      </div>
    )
  }
}

export default App
