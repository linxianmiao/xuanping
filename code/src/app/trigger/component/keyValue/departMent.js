import React, { Component } from 'react'
import { Tag, Modal } from '@uyun/components'
import UserSystem from '../../../users/userSystem'

class Department extends Component {
    state = {
      visible: false, // 部门选择组件的显示隐藏
      chexkedDepartListId: this.props.initialValue || []
    }

    // 显示部门组件弹框
    showAddUser = () => {
      if (this.props.disabled) return false
      this.setState({ visible: true })
    }

    // 部门组件弹窗取消
    addUserCancel = () => {
      this.setState({ visible: false })
    }

    // 添加部门
    addUserOk = list => {
      const chexkedDepartListId = list.map(item => item.id)
      this.props.onChangeCondition && this.props.onChangeCondition(chexkedDepartListId)
      this.setState({
        visible: false,
        chexkedDepartListId
      })
    }

    // 删除当前选中的部门
    closeUser = (id, e) => {
      e.stopPropagation()
      const oldVal = this.props.value
      const newVal = oldVal.filter(item => item !== id)
      this.props.onChangeCondition && this.props.onChangeCondition(newVal)
      this.setState({ chexkedDepartListId: newVal })
    }

    render () {
      const { departList } = this.props
      const { visible, chexkedDepartListId } = this.state
      const diliver = { status: { status1: 0, status2: 1, status3: 1 }, opt: 1 }
      const checkedDepartList = departList.filter(item => chexkedDepartListId.includes(item.id)) // 当前选中的用户
      return (
        <div>
          <div className="tags-lists" onClick={() => this.showAddUser()} placeholder={i18n('ticket.create.select_handler', '请选择处理人')}>
            {
              checkedDepartList.map(item => {
                return (
                  <Tag key={item.id} onClose={e => { this.closeUser(item.id, e) }}>
                    { item.name }
                  </Tag>
                )
              })
            }
          </div>
          <Modal
            visible={visible}
            onCancel={this.addUserCancel}
            width={620}
            footer={''}
            className="mymodelstyle smallModal">
            <UserSystem
              onCancel={this.addUserCancel}
              onOk={this.addUserOk}
              title={i18n('select_department', '选择部门')}
              selectedData={checkedDepartList}
              {...diliver} />
          </Modal>
        </div>
      )
    }
}

export default Department
