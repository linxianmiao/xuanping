import React, { Component } from 'react'
import { Form, Select, Input } from '@uyun/components'

import { Common } from '../index'
import CommonConfig from '../../config/commonConfig'

const FormItem = Form.Item

class NestedTable extends Component {
  state = {
    tableCodeOptions: []
  }

  queryAllTableFields = () => {
    const params = {
      fieldTypes: 'table'
    }
    axios.get(API.query_field_with_type, { params }).then((res) => {
      this.setState((prevState) => {
        return { tableCodeOptions: res['table'] }
      })
    })
  }

  componentDidMount() {
    this.queryAllTableFields()
  }

  render() {
    const { formItemLayout } = this.props
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: CommonConfig,
      type: 'nestedTable'
    })
    const { tableCode, inlineName } = this.props.fieldData
    let tableCodeOptions = this.state.tableCodeOptions || []
    tableCodeOptions = tableCodeOptions.map((o) => ({ name: o.name, value: o.code }))

    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={i18n('field_value_table_code', '关联表格')}>
          {getFieldDecorator('tableCode', {
            initialValue: tableCode,
            rules: [{ required: true }]
          })(
            <Select
              allowClear
              showSearch
              style={{ width: '100%' }}
              optionFilterProp="children"
              dropdownMatchSelectWidth={false}
              placeholder={i18n('globe.select', '请选择')}
              notFoundContent={i18n('globe.notFound', '无法找到')}
              onChange={this.handleSelectChange}
            >
              {_.map(tableCodeOptions, (item) => (
                <Select.Option key={item.value}>{item.name}</Select.Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('field_value_inline_name', '内联名称')}>
          {getFieldDecorator('inlineName', {
            initialValue: inlineName || '编辑',
            rules: [{ required: true }]
          })(<Input />)}
        </FormItem>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: (props, changedValues, allValues) => {
    props.onValuesChange && props.onValuesChange()
  }
})(NestedTable)
