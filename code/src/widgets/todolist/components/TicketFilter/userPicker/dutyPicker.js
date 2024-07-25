import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import PickerPane from './pickerPane'
import BasicPicker from './basicPicker'
import { StoreConsumer } from './config'
@inject('userPickStore')
@observer
export default class DutyPicker extends BasicPicker {
  get extendQuery() {
    return { type: 4 }
  }

  render () {
    const { rowKey, type } = this.props
    const { list, query } = this.state
    const selectedRowKeys = _.map(this.props.value.dutys, item => item.id)
    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      }
    ]
    return (
      <StoreConsumer>
        {
          ({ props }) => (
            <PickerPane
              query={query}
              columns={columns}
              dataSource={list}
              rowKey={rowKey}
              type={type}
              selectionType={props.selectionType}
              selectedRowKeys={selectedRowKeys}
              onSelectAll={this.onSelect}
              onSelect={this.onSelect}
              handleChangeQuery={this.handleChangeQuery}
            />
          )
        }

      </StoreConsumer>
    )
  }
}
