import React, { Component } from 'react'
import { Form } from '@uyun/components'
import FieldGroupLazySelect from '~/components/FieldGroupSelect/LazySelect'
import { withRouter } from 'react-router-dom'
const FormItem = Form.Item

@withRouter
class FieldLayouts extends Component {
  render () {
    const { formItemLayout, getFieldDecorator, item, defaultValue } = this.props
    const { builtin } = this.props.fieldData
    const { id, name } = defaultValue || {}
    return (
      <div>
        { builtin !== 1 ? <FormItem {...formItemLayout} label={item.name}>
          {getFieldDecorator(item.code, {
            initialValue: id ? { key: id, label: name } : undefined,
            rules: [{
              required: true, message: i18n('pls_sel_field_group', '请选择字段分组')
            }]
          })(
            <FieldGroupLazySelect style={item.style} labelInValue />
          )}
        </FormItem> : null }
      </div>
    )
  }
}

export default FieldLayouts
