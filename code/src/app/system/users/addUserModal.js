import React, { Component } from 'react'
import { SearchOutlined } from '@uyun/icons';
import { Modal, Input, Table, Icon } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import { autorun, toJS } from 'mobx'

@inject('store', 'userStore')
@observer
class AddUserModal extends Component {
    state = {
      selectedRowKeys: []
    }

    onSelectChange = selectedRowKeys => {
      this.setState({ selectedRowKeys })
    }

    componentDidMount () {
      this.disposer = autorun(() => {
        const { wd, pageNum, pageSize } = this.props.userStore
        const groupId = this.props.store.active
        const data = { wd, pageNum, pageSize, groupId }
        this.props.userStore.getUserList(data)
      })
    }

    onChange = e => {
      this.props.userStore.setWd(e.target.value)
    }

    componentWillUnmount () {
      this.disposer()
      this.props.userStore.distory()
    }

    changePage = page => {
      this.props.userStore.setPage(page)
    }

    onOk = () => {
      const data = {
        groupId: this.props.store.active,
        userIds: this.state.selectedRowKeys
      }
      this.props.userStore.addUserToGroup(data, () => {
        this.props.onOk()
      })
    }

    render () {
      const { visible } = this.props
      const { list, count } = toJS(this.props.userStore.data)
      const { selectedRowKeys } = this.state
      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange
      }
      const pagination = {
        total: count,
        currnet: this.props.userStore.pageNum,
        size: 'small',
        onChange: current => {
          this.changePage(current)
        }
      }
      const columns = [{
        title: i18n('real_name', '姓名'),
        dataIndex: 'userName'
      }, {
        title: i18n('user_mail', '邮箱'),
        dataIndex: 'userEmail'
      }]
      return (
        <Modal
          width={600}
          visible={visible}
          maskClosable={false}
          onOk={this.onOk}
          onCancel={this.props.onCancel}
        >
          <div className="system-add-user-modal">
            <div className="system-add-user-header">
              <Input style={{ width: 200 }}
                prefix={<SearchOutlined />}
                onChange={this.onChange}
                placeholder={i18n('input_keyword', '请输入关键字')}
              />
            </div>
            <div className="system-add-user-body">
              <Table
                rowKey="userId"
                rowSelection={rowSelection}
                columns={columns}
                dataSource={list}
                pagination={pagination}
              />
            </div>
          </div>
        </Modal>
      );
    }
}

export default AddUserModal
