import React, { Component } from 'react'
// import { inject, observer } from 'mobx-react'
import { Table, Input, Select } from '@uyun/components'
import { getGroupId } from '../logic'
import styles from './index.module.less'

const { Option } = Select

export default class GroupList extends Component {
  state = {
    list: [],
    pageNo: 1,
    loadMore: false,
    filters: {}
  }

  componentDidMount() {
    const { serviceRange } = this.props
    const appIdArr = serviceRange.length > 0 ? _.map(serviceRange, (d) => d.appId) : []

    const { filters } = this.state
    this.setState({ filters: { ...filters, appId: appIdArr } }, () => {
      this.query()
    })
  }

  query = async (params = {}) => {
    const pageSize = 10
    const { kw, appId } = this.state.filters
    const nextParams = {
      pageNo: this.state.pageNo,
      pageSize,
      kw,
      appId: appId.length > 0 ? appId.join(',') : undefined,
      ...params
    }

    if (nextParams.pageNo > this.state.pageNo) {
      this.setState({ loadMore: true })
    }

    let res = (await axios.get(API.listDiffGroupsByAppId, { params: nextParams })) || []
    res = res.map((item) => ({ ...item, applicationId: item.groupId, status: 0 }))

    this.setState({
      list: nextParams.pageNo === 1 ? res : this.state.list.concat(res),
      pageNo: nextParams.pageNo,
      loadMore: res.length < pageSize ? 'finished' : false
    })
  }

  handleLoadMore = () => {
    const { pageNo } = this.state

    this.query({ pageNo: pageNo + 1 })
  }

  handleRowSelect = (keys, rows) => {
    const { checkedGroups, onCheckGroups } = this.props
    const { list } = this.state

    const listKeys = list.map((item) => item.groupId)

    const nextCheckedGroups = checkedGroups
      .filter((item) => !listKeys.includes(item.groupId))
      .concat(rows)

    onCheckGroups(nextCheckedGroups)
  }

  render() {
    const { show, checkedGroups, serviceRange } = this.props
    const { list, loadMore, filters } = this.state

    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '编码',
        dataIndex: 'code',
        width: 220
      },
      {
        title: '分类',
        width: 220
      }
    ]

    const rowSelection = {
      selectedRowKeys: checkedGroups.map(getGroupId),
      onChange: this.handleRowSelect
    }

    return (
      <div className={!show ? styles.hide : ''}>
        <div className={styles.widgets}>
          <Input.Search
            style={{ width: 300 }}
            placeholder="请输入关键字"
            allowClear
            enterButton
            value={filters.kw}
            onChange={(e) => this.setState({ filters: { ...filters, kw: e.target.value } })}
            onSearch={(value) => {
              this.query({ kw: value, pageNo: 1 })
            }}
            onClear={() => {
              this.setState({ filters: { ...filters, kw: '' } })
              this.query({ kw: '', pageNo: 1 })
            }}
          />
          <Select
            style={{ marginLeft: 10, width: 200 }}
            placeholder="请选择应用"
            showSearch
            mode="multiple"
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            allowClear
            value={filters.appId}
            onChange={(appId) => {
              this.setState({ filters: { ...filters, appId } })
              this.query({ appId, pageNo: 1 })
            }}
          >
            {serviceRange.map((item) => {
              const { appId, appName, enName } = item
              return <Option key={appId}>{`${appName} ${enName}`}</Option>
            })}
          </Select>
        </div>
        <Table
          rowKey="groupId"
          columns={columns}
          size="small"
          dataSource={list}
          pagination={false}
          scroll={{ y: 263 }}
          loadMore={loadMore}
          onLoadMore={this.handleLoadMore}
          rowSelection={rowSelection}
        />
      </div>
    )
  }
}
