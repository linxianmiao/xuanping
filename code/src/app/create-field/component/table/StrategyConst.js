import React, { Component } from 'react'
import { DoubleRightOutlined, PlusOutlined } from '@uyun/icons'
import { Button, Form, Select } from '@uyun/components'
const FormItem = Form.Item
const Option = Select.Option
export default class StrategyConst extends Component {
  handleChange = (value, type, index, item) => {
    this.props.onChange(_.assign({}, item, { [type]: value }), index)
  }

  render() {
    const { list, observableCell, columns, fields, isError } = this.props
    // 找出监听列引用的字段
    const column = _.find(columns, (item) => item.value === observableCell) || {}
    const field = _.find(fields, (field) => field.code === column.source) || {}
    return (
      <div>
        {_.map(list, (item, index) => {
          return (
            <div key={index} className="u4-form u4-form-inline">
              <FormItem
                style={{ marginBottom: 0 }}
                validateStatus={isError && !item.observableCellExpandCode ? 'error' : ''}
              >
                <Select
                  showSearch
                  style={{ width: 200 }}
                  optionFilterProp="children"
                  value={item.observableCellExpandCode || undefined}
                  onChange={(value) => {
                    this.handleChange(value, 'observableCellExpandCode', index, item)
                  }}
                  placeholder={i18n('globe.select', '请选择')}
                  notFoundContent={i18n('globe.notFound', '无法找到')}
                >
                  {!_.isEmpty(field) && (
                    <Option key="_value">{i18n('option_value', '选项值')}</Option>
                  )}
                  {_.chain(field)
                    .get('expandSel')
                    .map((data) => <Option key={data}>{`${field.code}.${data}`}</Option>)
                    .value()}
                </Select>
              </FormItem>

              <FormItem>
                <DoubleRightOutlined />
              </FormItem>

              <FormItem
                style={{ marginBottom: 0 }}
                validateStatus={isError && !item.cellCode ? 'error' : ''}
              >
                <Select
                  showSearch
                  value={item.cellCode || undefined}
                  style={{ width: 200 }}
                  optionFilterProp="children"
                  onChange={(value) => {
                    this.handleChange(value, 'cellCode', index, item)
                  }}
                  placeholder={i18n('globe.select', '请选择')}
                  notFoundContent={i18n('globe.notFound', '无法找到')}
                >
                  {_.map(columns, (column) => (
                    <Option key={column.value} disabled={column.source === field.code}>
                      {column.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              {list.length > 1 && (
                <FormItem>
                  <i
                    className="iconfont icon-guanbi1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      this.props.onDel(index)
                    }}
                  />
                </FormItem>
              )}
            </div>
          )
        })}
        <Button style={{ marginTop: 15 }} onClick={this.props.onAdd} icon={<PlusOutlined />}>
          {i18n('user_group_add', '添加')}
        </Button>
      </div>
    )
  }
}
