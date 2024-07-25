import React from 'react'
import { inject, observer } from 'mobx-react'
import PickerPane from './pickerPane'
import BasicPicker from './basicPicker'
@inject('userPickStore')
@observer
class RolePickerPane extends BasicPicker {
  get extendQuery() {
    return {
      type: 3,
      model: this.props.extendQuery?.modelId,
      tenantId: this.props.extendQuery?.tenantId
    }
  }

  render() {
    const { rowKey, type, selectionType } = this.props
    const { list, total, query } = this.state
    const selectedRowKeys = _.filter(this.props.value.all, (item) => item.type === 'roles').map(
      (item) => item.id
    )
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
export default RolePickerPane
