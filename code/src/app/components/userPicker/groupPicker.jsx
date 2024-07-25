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
    const { rowKey, type, selectionType, value, mode } = this.props
    const { list, total, query } = this.state
    // const selectedRowKeys = _.map(value.groups, item => item.groupId)
    const selectedRowKeys = _.filter(value.all, (item) => item.type === 'groups').map(
      (item) => item.groupId
    )
    const columns = [
      {
        title: i18n('name', '名称'),
        dataIndex: 'name'
      },
      {
        title: i18n('field_code', '编码'),
        dataIndex: 'code'
      },
      {
        title: i18n('conf.model.field.card.desc', '描述'),
        dataIndex: 'description'
      }
    ]
    return (
      <PickerPane
        query={query}
        type={type}
        mode={mode}
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
