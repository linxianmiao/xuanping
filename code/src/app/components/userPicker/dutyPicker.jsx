import React from 'react'
import { inject, observer } from 'mobx-react'
import PickerPane from './pickerPane'
import BasicPicker from './basicPicker'
import { StoreConsumer } from './config'
@inject('userPickStore')
@observer
class DutyPicker extends BasicPicker {
  get extendQuery() {
    return {
      type: 4,
      modelId: this.props.extendQuery?.modelId,
      tenantId: this.props.extendQuery?.tenantId
    }
  }

  parseList = (list) => {
    // 服务端返回的值班列表，id不足32位，这里用前置0补充
    return list.map((item) => {
      const lackLength = 32 - item.id.length

      if (lackLength > 0) {
        const id = Array(lackLength).fill('0').join('') + item.id
        return { ...item, id }
      }

      return item
    })
  }

  render() {
    const { rowKey, type, value } = this.props
    const { list, query } = this.state
    const selectedRowKeys = _.filter(value.all, (item) => item.type === 'dutys').map(
      (item) => item.id
    )
    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      }
    ]
    return (
      <StoreConsumer>
        {({ props }) => (
          <PickerPane
            query={query}
            columns={columns}
            dataSource={this.parseList(list)}
            rowKey={rowKey}
            type={type}
            selectionType={props.selectionType}
            selectedRowKeys={selectedRowKeys}
            onSelectAll={this.onSelect}
            onSelect={this.onSelect}
            handleChangeQuery={this.handleChangeQuery}
          />
        )}
      </StoreConsumer>
    )
  }
}

export default DutyPicker
