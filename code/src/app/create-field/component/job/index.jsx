import React, { Component } from 'react'
import { Form, Checkbox } from '@uyun/components'
import { Common } from '../index'
import CommonConfig from '../../config/commonConfig'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

class Group extends Component {
  render() {
    const { value = [], onChange } = this.props

    const options = [
      { label: '创建执行计划', value: '1' },
      { label: '创建定时作业', value: '2' },
      { label: '停用定时作业', value: '3' }
    ]

    return <CheckboxGroup options={options} value={value} onChange={onChange} />
  }
}

class Job extends Component {
  render() {
    const { formItemLayout, fieldData } = this.props
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const restProps = {
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
      config: [...CommonConfig]
    }

    return (
      <Common {...this.props} {...restProps}>
        <FormItem {...formItemLayout} label={i18n('action', '动作')} required>
          {getFieldDecorator('actionType', {
            initialValue: fieldData.actionType || undefined,
            rules: [
              {
                required: true,
                message: i18n('globe.select', '请选择')
              }
            ]
          })(<Group />)}
        </FormItem>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(Job)
