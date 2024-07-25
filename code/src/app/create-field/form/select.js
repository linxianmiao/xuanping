import React, { Component } from 'react'
import { Form, Select } from '@uyun/components'
const FormItem = Form.Item
const Option = Select.Option

class ITSMSelect extends Component {
  render () {
    const { formItemLayout, item, getFieldDecorator, defaultValue, setFieldsValue } = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue,
          rules: [{
            required: item.required === 1
          }],
          onChange: val => {
            if (item.code === 'chartType' && val === '2') {
              setFieldsValue({ resourceType: ['only-add'] })
            }
          }
        })(
          <Select
            notFoundContent={i18n('globe.notFound', '无法找到')}
            getPopupContainer={el => el}
            style={{ width: '100%' }}>
            { _.map(item.params, param => {
              return (
                <Option key={param.value} value={param.value}>
                  { param.label }
                </Option>
              )
            })}
          </Select>
        )}
      </FormItem>
    )
  }
}

export default ITSMSelect
