import React, { Component } from 'react'
import { Form } from '@uyun/components'
import TagsInput from '../tagsInput'

const FormItem = Form.Item

class Tags extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue } = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {
          getFieldDecorator(item.code, {
            initialValue: defaultValue
          })(<TagsInput size="small" />)
        }
      </FormItem>
    )
  }
}

export default Tags
