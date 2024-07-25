import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'

import Filter from './components/Filter'
import BasicTable from './components/BasicTable'

@inject('entrustStore')
@observer
export default class EntrustMe extends Component {
  entrustMe = React.createRef()

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
      values = this.entrustMe.current.props.form.getFieldsValue()
    }
    const { processId, entrust_status, audit_status } = values
    const { pageNum, pageSize } = this.state
    const data = {
      type: 3,
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
        render: (text, record) => <a onClick={() => { this.props.onChangeEntrustmessage(record) }}> 详情</a>
      }
    ]
    return (
      <div>
        <Filter wrappedComponentRef={this.entrustMe} getList={this.getList} />
        <BasicTable
          exColumns={exColumns}
          dataSource={list}
          loading={loading}
          pagination={pagination}
          rowKey={record => record.id}
        />
      </div>
    )
  }
}
