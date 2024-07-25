import React from 'react'
import { observer } from 'mobx-react'

import PickerPane from './pickerPane'
import BasicPicker from './basicPicker'

@observer
class GroupPickerPane extends BasicPicker {
  get extendQuery() {
    const extendQuery = this.props.extendQuery || {}

    return { ...extendQuery, type: 0 }
  }

  render() {
    const { rowKey, type, selectionType, value } = this.props
    const { list, total, query } = this.state
    // const selectedRowKeys = _.map(value.groups, item => item.groupId)
    const selectedRowKeys = _.filter(value.all, (item) => item.type === 'groups').map(
      (item) => item.groupId
    )
    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '编码',
        dataIndex: 'code'
      },
      {
        title: '分类',
        dataIndex: 'hierarchy'
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

export default GroupPickerPane
