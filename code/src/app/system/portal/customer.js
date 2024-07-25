import React, { Component } from 'react'
import { store as runtimeStore } from '@uyun/runtime-react'
import { SearchOutlined } from '@uyun/icons'
import { Input, Button, Table, Switch } from '@uyun/components'
import { observer } from 'mobx-react'
import { autorun, toJS } from 'mobx'
import ImportModal from './importModal'
import UserModal from './userModal'
import { encrypt } from '../../../assets/utils'
import './style/customer.less'

@observer
class Customer extends Component {
  state = {
    importVisible: false,
    userVisible: false,
    type: '',
    id: ''
  }

  componentDidMount() {
    this.disposer = autorun(() => {
      const { pageNum, pageSize, wd } = this.props.store
      const data = { pageNum, pageSize, wd }
      this.props.store.getUserList(data)
    })
  }

  onImportModal = () => {
    this.setState({ importVisible: true })
  }

  onUserModal = () => {
    this.setState({ userVisible: true, type: 'create' })
  }

  onDetail = (id) => {
    this.props.store.onDetail({ id: id }, () => {
      this.setState({
        userVisible: true,
        type: 'edit',
        id: id
      })
    })
  }

  onClose = () => {
    this.props.store.onClearUser(() => {
      this.setState({
        importVisible: false,
        userVisible: false,
        type: '',
        id: ''
      })
    })
  }

  onSubmit = (values) => {
    const type = this.state.type
    const status = values.status ? 1 : 0
    const password = encrypt(values.password)
    const { email, phone, real_name, sex, user_name } = values
    if (type === 'create') {
      const data = { email, password, phone, real_name, sex, status, user_name }
      this.props.store.onCreate(data, () => {
        this.onClose()
      })
    }
    if (type === 'edit') {
      const id = this.state.id
      const data = { id, email, password, phone, real_name, sex, status, user_name }
      this.props.store.onUpdate(data, () => {
        this.onClose()
      })
    }
  }

  onDelete = (id) => {
    this.props.store.onDelete({ id: id })
  }

  onChange = (e) => {
    const value = e.target.value
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.props.store.onWd(value)
    }, 500)
  }

  onRefresh = () => {
    this.props.store.onRefresh()
    this.onClose()
  }

  changeStatus = (id, checked) => {
    const data = {
      id: id,
      state: checked ? 1 : 0
    }
    this.props.store.updateStatus(data)
  }

  componentWillUnmount() {
    this.disposer()
    clearTimeout(this.timer)
    this.props.store.distory()
  }

  render() {
    const columns = [
      {
        title: i18n('real_name', '姓名'),
        dataIndex: 'real_name'
      },
      {
        title: i18n('user_name', '用户名'),
        dataIndex: 'user_name'
      },
      {
        title: i18n('email', '邮箱'),
        dataIndex: 'email'
      },
      {
        title: i18n('phone', '手机号码'),
        dataIndex: 'phone'
      },
      {
        title: i18n('enabled_status', '启用状态'),
        dataIndex: 'status',
        render: (data, row) => {
          return (
            <Switch
              checkedChildren={i18n('enable', '开启')}
              unCheckedChildren={i18n('disable', '停用')}
              checked={row.status === 1}
              onChange={(status) => {
                this.changeStatus(row.id, status)
              }}
            />
          )
        }
      },
      {
        title: i18n('operation', '操作'),
        dataIndex: 'operation',
        width: 200,
        className: 'uy-table-td-href',
        render: (data, row) => {
          return runtimeStore.getState().user?.root ? (
            <span className="operation">
              <Button
                onClick={() => {
                  this.onDetail(row.id)
                }}
                className="href-btn normal"
              >
                {i18n('edit', '编辑')}
              </Button>
              <Button
                onClick={() => {
                  this.onDelete(row.id)
                }}
                className="href-btn warning"
                disabled={row.status === 1}
              >
                {i18n('delete', '删除')}
              </Button>
            </span>
          ) : null
        }
      }
    ]
    const { data, loading, count, user } = toJS(this.props.store)
    const { importVisible, userVisible, type } = this.state
    const pagination = {
      total: count,
      current: this.props.store.pageNum,
      showQuickJumper: true,
      onChange: (current) => {
        this.props.store.onPage(current)
      }
    }
    return (
      <div className="system-config-portal-customer">
        <div className="portal-customer-header clearfix">
          <Input
            style={{ width: 240 }}
            size="large"
            prefix={<SearchOutlined />}
            onChange={this.onChange}
            placeholder={i18n('input_keyword', '请输入关键字')}
          />
          <div className="right">
            <Button type="primary" onClick={this.onImportModal}>
              {i18n('batch_import', '批量导入')}
            </Button>
            <Button type="primary" onClick={this.onUserModal}>
              {i18n('new_user', '新建用户')}
            </Button>
          </div>
        </div>
        <div className="portal-customer-body">
          <Table
            pagination={pagination}
            dataSource={data}
            rowKey={(row) => row.id}
            columns={columns}
            loading={{ delay: 500, spinning: loading }}
          />
        </div>
        {importVisible && (
          <ImportModal visible={importVisible} onCancel={this.onClose} onFresh={this.onRefresh} />
        )}
        {userVisible && (
          <UserModal
            data={user}
            visible={userVisible}
            onCancel={this.onClose}
            onOk={this.onSubmit}
            type={type}
          />
        )}
      </div>
    )
  }
}

export default Customer
