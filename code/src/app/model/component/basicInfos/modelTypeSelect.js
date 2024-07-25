import React from 'react'
import { Form } from '@uyun/components'
import ModelTypeLazySelect from '~/components/ModelTypeSelect/LazySelect'

const FormItem = Form.Item

const ModelTypeFormItem = props => {
  const { item, getFieldDecorator, formItemLayout, defaultValue } = props
  return (
    <FormItem {...formItemLayout} label={item.name}>
      {
        getFieldDecorator(item.code, {
          initialValue: defaultValue || undefined,
          rules: [{
            required: item.required === 1,
            message: `${i18n('ticket.create.select', '请选择')}${item.name}`
          }]
        })(<ModelTypeLazySelect labelInValue />)
      }
    </FormItem>
  )
}

export default ModelTypeFormItem
