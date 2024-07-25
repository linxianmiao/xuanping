import React, { Component } from 'react'
import { Form, Input, Table, Checkbox } from '@uyun/components'

export default class PickerPane extends Component {
  static defaultProps = {
    onSelect: () => {},
    onSelectAll: () => {},
    onChangeUseVariable: () => {}
  }

  onSelect = (record, selected, selectedRows) => {
    this.props.onSelect([record], selected)
  }

  onSelectAll = (selected, selectedRows, changeRows) => {
    this.props.onSelectAll(changeRows, selected)
  }

  // 是否勾选 当变量有值时，仅选择变量值作为处理人 仅在变量的tab也使用
  onChange = (e) => {
    this.props.onChangeUseVariable(e.target.checked)
  }

  render() {
    const {
      rowKey,
      size,
      columns,
      dataSource,
      total,
      query,
      type,
      useVariable,
      selectedRowKeys,
      selectionType,
      handleChangeQuery
    } = this.props
    const { pageNo, pageSize } = query
    const pagination = {
      total,
      size: 'small',
      showTotal: false,
      showQuickJumper: false,
      current: pageNo,
      pageSize,
      onChange: (pageNo, pageSize) => {
        handleChangeQuery(_.assign({}, query, { pageNo, pageSize }))
      }
    }
    return (
      <div>
        <Form layout="inline">
          <Form.Item>
            <Input.Search
              allowClear
              enterButton
              placeholder="请输入关键字"
              onSearch={(value) => {
                handleChangeQuery(_.assign({}, query, { kw: value }))
              }}
              onClear={(e) => {
                handleChangeQuery(_.assign({}, query, { kw: e.target.value }))
              }}
            />
          </Form.Item>
          {type === 'variables' && (
            <Form.Item>
              <Checkbox checked={useVariable} onChange={this.onChange}>
                {i18n('variable-tip', '当变量有值时，仅选择变量值作为处理人')}
              </Checkbox>
            </Form.Item>
          )}
        </Form>

        <Table
          rowKey={rowKey}
          size={size}
          columns={columns}
          dataSource={dataSource}
          rowSelection={{
            type: selectionType,
            selectedRowKeys,
            onSelect: this.onSelect,
            onSelectAll: this.onSelectAll
          }}
          pagination={pagination}
        />
      </div>
    )
  }
}
