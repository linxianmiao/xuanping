import React from 'react'
import { inject, observer } from 'mobx-react'
import PickerPane from './pickerPane'
import BasicPicker from './basicPicker'

@inject('userPickStore')
@observer
class GroupPickerPane extends BasicPicker {
  get extendQuery() {
    const extendQuery = this.props.extendQuery || {}

    return { ...extendQuery, type: 0 }
  }

  render() {
    const { rowKey, type, selectionType, value } = this.props
    const { list, total, query } = this.state
    const selectedRowKeys = _.map(value.groups, item => item.id)
    const columns = [
      {
        title: i18n('name', '名称'),
        dataIndex: 'name'
      },
      {
        title: i18n('business.unit', '业务单位'),
        dataIndex: 'businessUnit'
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
