import React, { Component } from 'react'
import moment from 'moment'
import { CheckCircleFilled, CloseCircleFilled } from '@uyun/icons'
import { Input, Select, Table, Icon } from '@uyun/components'
import PageHeader from '~/components/pageHeader'
import './index.less'
const Option = Select.Option
export default class Index extends Component {
  state = {
    kw: '',
    authStatus: undefined,
    applyType: undefined,
    pageNo: 1,
    pageSize: 20,
    list: [],
    count: 0,
    loading: false
  }

  componentDidMount() {
    this.queryModelAuthRecords()
  }

  queryModelAuthRecords(refresh) {
    const { pageNo, pageSize, kw, authStatus, applyType } = this.state
    const params = { pageNo: refresh ? 1 : pageNo, pageSize, kw, authStatus, applyType }

    this.setState({ loading: true })
    axios.get(API.queryModelAuthRecords, { params }).then((res) => {
      this.setState({
        list: res.list,
        total: res.total,
        loading: false
      })
    })
  }

  render() {
    const { kw, authStatus, applyType, pageNo, pageSize, list, total, loading } = this.state
    const columns = [
      {
        title: i18n('model_name', '模型名称'),
        dataIndex: 'name',
        width: '14%'
      },
      {
        title: i18n('permission-applicant', '申请人'),
        dataIndex: 'applyUser'
      },
      {
        title: i18n('permission-applicantType', '申请类别'),
        dataIndex: 'applyType',
        render: (text) => (
          <div>
            {text === 1
              ? '启用'
              : text === 2
              ? '停用'
              : text === 3
              ? '发布'
              : text === 4
              ? '删除'
              : ''}
          </div>
        )
      },
      {
        title: i18n('permission-application-time', '申请时间'),
        dataIndex: 'applyTime',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '')
      },
      {
        title: i18n('permission-Approver', '审批人'),
        dataIndex: 'author'
      },
      {
        title: i18n('permission-Approver-action', '审批动作'),
        dataIndex: 'authStatus',
        render: (text) => {
          return (
            <div>
              {text === 1 ? (
                <div style={{ color: '#3CD768' }}>
                  <CheckCircleFilled />
                  <span style={{ marginLeft: 5 }}>{'通过'}</span>
                </div>
              ) : text === 2 ? (
                <div style={{ color: '#FF4848 ' }}>
                  <CloseCircleFilled />
                  <span style={{ marginLeft: 5 }}>{'驳回'}</span>
                </div>
              ) : (
                ''
              )}
            </div>
          )
        }
      },
      {
        title: i18n('permission-application-handleTime', '处理时间'),
        dataIndex: 'authTime',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '')
      }
    ]
    const pagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
      total: total,
      current: pageNo,
      pageSize: pageSize,
      onShowSizeChange: (pageNo, pageSize) => {
        this.setState({ pageNo, pageSize }, () => {
          this.queryModelAuthRecords()
        })
      },
      onChange: (pageNo, pageSize) => {
        this.setState({ pageNo, pageSize }, () => {
          this.queryModelAuthRecords()
        })
      }
    }
    return (
      <div className="itsm-model-list-wrap">
        <PageHeader />
        <div className="model-list-header">
          <div>
            <Input.Search
              placeholder={i18n('input_keyword', '请输入关键字')}
              style={{ width: 240, marginRight: 15, verticalAlign: 'top' }}
              allowClear
              enterButton
              value={kw}
              onChange={(e) => this.setState({ kw: e.target.value })}
              onSearch={() => this.queryModelAuthRecords(true)}
              onClear={() => {
                this.setState({ kw: undefined }, () => {
                  this.queryModelAuthRecords(true)
                })
              }}
            />

            <Select
              placeholder={i18n('Pleact.select.type', '请选择申请类别')}
              style={{ width: 240, marginRight: 15, verticalAlign: 'top' }}
              value={applyType}
              optionFilterProp="children"
              allowClear
              onChange={(value) =>
                this.setState({ applyType: value }, () => {
                  this.queryModelAuthRecords(true)
                })
              }
            >
              <Option value="1">启用</Option>
              <Option value="2">停用</Option>
              {/* <Option value="3">发布</Option> */}
              <Option value="4">删除</Option>
            </Select>
            <Select
              placeholder={i18n('Pleact.select.type', '请选择审批动作')}
              style={{ width: 240, marginRight: 15, verticalAlign: 'top' }}
              optionFilterProp="children"
              allowClear
              value={authStatus}
              onChange={(value) =>
                this.setState({ authStatus: value }, () => {
                  this.queryModelAuthRecords(true)
                })
              }
            >
              <Option value="1">通过</Option>
              <Option value="2">驳回</Option>
            </Select>
          </div>
        </div>
        <Table
          loading={loading}
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={list}
          pagination={pagination}
        />
      </div>
    )
  }
}
