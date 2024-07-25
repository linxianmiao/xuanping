import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { PlusOutlined } from '@uyun/icons';
import { Button, message, Modal } from '@uyun/components'
import { withRouter } from 'react-router-dom'
import classnames from 'classnames'

import Filter from './components/Filter'
import BasicTable from './components/BasicTable'

@withRouter
@inject('entrustStore')
@observer
export default class EntrustForce extends Component {
  entrustForce = React.createRef()

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
      values = this.entrustForce.current.props.form.getFieldsValue()
    }
    const { processId, entrust_status, consignor, consignee } = values
    const { pageNum, pageSize } = this.state
    const data = {
      type: 4,
      pageNum,
      pageSize,
      consignor: consignor ? consignor[0] : undefined,
      consignee: consignee ? consignee[0] : undefined,
      entrust_status,
      modelId: _.get(processId, 'key')
    }
    this.setState({ loading: true })
    const res = await this.props.entrustStore.getEntrustList(data)
    this.setState({ loading: false, entrust: res })
  }

  handleCancelEntrust = async record => {
    if (record.entrustStatus !== 1) return
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
    const exColumns = [
      {
        title: '操作',
        render: (text, record) =>
          <span className="entrust-table-operation">
            <a onClick={() => { this.props.onChangeEntrustmessage(record) }}> 详情</a>
            <a className={classnames({ 'xcf-disabled': [1, 2].includes(record.entrustStatus) })}
              onClick={() => {
                if ([1, 2].includes(record.entrustStatus)) return
                sessionStorage.setItem('entrustForceRecord', JSON.stringify(record))
                this.props.history.push({
                  pathname: '/conf/entrust/create-force',
                  search: `?entrustId=${record.id}`
                })
              }}> 修改</a>
            <a className={classnames({ 'xcf-disabled': record.entrustStatus !== 1 })}
              onClick={() => { this.handleCancelEntrust(record) }}> 取消委托</a>
          </span>

      }
    ]
    return (
      <div>
        <div className="entrust-tabs-head">
          <Filter currentTab={this.props.currentTab} wrappedComponentRef={this.entrustForce} getList={this.getList} />
          <Button icon={<PlusOutlined />} type="primary" onClick={() => { this.props.history.push('/conf/entrust/create-force') }}>新增强制委托</Button>
        </div>

        <BasicTable
          exColumns={exColumns}
          currentTab={this.props.currentTab}
          dataSource={list}
          loading={loading}
          pagination={pagination}
          rowKey={record => record.id}
        />
      </div>
    );
  }
}
