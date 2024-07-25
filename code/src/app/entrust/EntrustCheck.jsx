import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import Filter from './components/Filter'
import BasicTable from './components/BasicTable'
import EntrustCheckModal from './components/EntrustCheckModal'

@inject('entrustStore')
@observer
export default class EntrustCheck extends Component {
  entrustCheck = React.createRef()

  state = {
    loading: false,
    pageNum: 1,
    pageSize: 20,
    checkModalDetail: null,
    entrust: null
  }

  componentDidMount () {
    this.getList()
  }

  getList = async (values) => {
    if (_.isEmpty(values)) {
      values = this.entrustCheck.current.props.form.getFieldsValue()
    }
    const { processId, entrust_status, audit_status } = values
    const { pageNum, pageSize } = this.state
    const data = {
      type: 2,
      pageNum,
      pageSize,
      entrust_status,
      audit_status,
      modelId: _.get(processId, 'key')
    }
    this.setState({ loading: true })
    const res = await await this.props.entrustStore.getEntrustList(data)
    this.setState({ loading: false, entrust: res })
  }

  handleCheckModalDetail = (checkModalDetail) => {
    this.setState({ checkModalDetail })
  }

  render () {
    const exColumns = [
      {
        title: '操作',
        render: (text, record) =>
          <span className="entrust-table-operation">
            <a onClick={() => { this.props.onChangeEntrustmessage(record) }}>详情</a>
            <a className={classnames({ 'xcf-disabled': record.auditStatus !== 0 })}
              onClick={() => { if (record.auditStatus === 0) this.handleCheckModalDetail(record) }}>审核</a>
          </span>
      }
    ]
    const { pageNum, pageSize, loading, checkModalDetail, entrust } = this.state
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
    return (
      <div>
        <Filter wrappedComponentRef={this.entrustCheck} getList={this.getList} />
        <BasicTable
          rowKey={record => record.id}
          loading={loading}
          exColumns={exColumns}
          dataSource={list}
          pagination={pagination}
        />
        <EntrustCheckModal
          getList={this.getList}
          checkModalDetail={checkModalDetail}
          handleCheckModalDetail={this.handleCheckModalDetail}
        />
      </div>
    )
  }
}
