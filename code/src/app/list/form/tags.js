import React, { Component } from 'react'
import { Form } from '@uyun/components'
import TagsInput from '~/components/tagsInput'

const FormItem = Form.Item

class Tags extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, disabled, label } = this.props
    return (
      <FormItem {...formItemLayout} label={label || item.name}>
        {
          getFieldDecorator(item.code, {
            initialValue: defaultValue
          })(<TagsInput size="small" disabled={disabled} />)
        }
      </FormItem>
    )
  }
}

export default Tags