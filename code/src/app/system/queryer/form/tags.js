import React, { Component } from 'react'
import { Form } from '@uyun/components'
import TagsInput from '~/components/tagsInput'

const FormItem = Form.Item

class Tags extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue,label } = this.props
    return (
      <FormItem {...formItemLayout} label={label}>
        {
          getFieldDecorator(item.code, {
            initialValue: defaultValue
          })(<TagsInput />)
        }
      </FormItem>
    )
  }
}

export default Tags