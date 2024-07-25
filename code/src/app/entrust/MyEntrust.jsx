import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { PlusOutlined } from '@uyun/icons';
import { Button, message, Modal } from '@uyun/components'
import BasicTable from './components/BasicTable'
import Filter from './components/Filter'
import classnames from 'classnames'

@withRouter
@inject('entrustStore')
@observer
export default class MyEntrust extends Component {
  myEntrust = React.createRef()

  state = {
    loading: false,
    pageNum: 1,
    pageSize: 20,
    entrust: null
  }

  componentDidMount () {
    this.getList()
  }

  getList = async (values) => {
    if (_.isEmpty(values)) {
      values = this.myEntrust.current.props.form.getFieldsValue()
    }
    const { processId, entrust_status, audit_status } = values
    const { pageNum, pageSize } = this.state
    const data = {
      type: 1,
      pageNum,
      pageSize,
      entrust_status,
      audit_status,
      modelId: _.get(processId, 'key')
    }
    this.setState({ loading: true })
    const res = await this.props.entrustStore.getEntrustList(data)
    this.setState({ loading: false, entrust: res })
  }

  handleDeleteEntrust = async record => {
    if (record.auditStatus === 1) { return false }
    Modal.confirm({
      title: '您是否确定删除？',
      onOk: async () => {
        await this.props.entrustStore.deleteEntrust({ id: [].concat(record.id) })
        message.success('删除成功')
        this.getList()
      }
    })
  }

  handleCancelEntrust = async record => {
    if (record.entrustStatus !== 1) return false

    Modal.confirm({
      title: '您是否确定取消委托？',
      onOk: async () => {
        await this.props.entrustStore.cancelEntrust({ id: [].concat(record.id) })
        message.success('取消委托成功')
        this.getList()
      }
    })
  }

  render () {
    const { pageNum, pageSize, loading, entrust } = this.state
    const { entrustDetailVoList: list, count } = entrust || {}
    const pagination = {
      total: count,
      current: pageNum,
      pageSize: pageSize,
      onShowSizeChange: (pageNum, pageSize) => {
        this.setState({ pageNum, pageSize }, () => { this.getList() })
      },
      onChange: (pageNum, pageSize) => {
        this.setState({ pageNum, pageSize }, () => { this.getList() })
      }
    }
    const mineColumns = [
      {
        title: '操作',
        render: (text, record) =>
          <span className="entrust-table-operation">
            <a onClick={() => { this.props.onChangeEntrustmessage(record) }}> 详情</a>
            <a className={classnames({ 'xcf-disabled': record.auditStatus === 1 })}
              onClick={() => { this.handleDeleteEntrust(record) }}>删除</a>
            <a className={classnames({ 'xcf-disabled': record.entrustStatus !== 1 })}
              onClick={() => { this.handleCancelEntrust(record) }}>取消委托</a>
          </span>
      }
    ]

    return (
      <div>
        <div className="entrust-tabs-head">
          <Filter wrappedComponentRef={this.myEntrust} getList={this.getList} />
          <Button icon={<PlusOutlined />} type="primary" onClick={() => { this.props.history.push('/conf/entrust/create') }}>新增委托</Button>
        </div>
        <BasicTable
          exColumns={mineColumns}
          rowKey={record => record.id}
          dataSource={list}
          loading={loading}
          pagination={pagination}
        />
      </div>
    );
  }
}
