import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { StoreConsumer } from './config'
import PickerPane from './pickerPane'
import BasicPicker from './basicPicker'
@inject('userPickStore')
@observer
export default class RolePickerPane extends BasicPicker {
  get extendQuery() {
    return { type: 3 }
  }

  render () {
    const { rowKey, type, selectionType } = this.props
    const { list, total, query } = this.state
    const selectedRowKeys = _.map(this.props.value.roles, item => item.id)
    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      }
    ]
    return (
      <PickerPane
        query={query}
        type={type}
        rowKey={rowKey}
        columns={columns}
        dataSource={list}
        total={total}
        selectionType={selectionType}
        selectedRowKeys={selectedRowKeys}
        onSelectAll={this.onSelect}
        onSelect={this.onSelect}
        handleChangeQuery={this.handleChangeQuery}
      />
    )
  }
}
