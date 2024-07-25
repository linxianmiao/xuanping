import React, { Component } from 'react'
import { Form, InputNumber } from '@uyun/components'
import RichTextConfig from './richTextConfig'

import {
  Common
} from '../index'

const FormItem = Form.Item
const defaultMaxLength = 1000

class MultiRowText extends Component {
  render () {
    const { formItemLayout, fieldData } = this.props
    const { getFieldDecorator } = this.props.form
    const { maxRowHeight } = fieldData
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      config: RichTextConfig,
      type: 'richText'
    })
    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={'高度限制'}>
            {getFieldDecorator('maxRowHeight', {
              initialValue: _.isNumber(maxRowHeight) ? maxRowHeight : undefined,
            })(
              <InputNumber min={0} max={defaultMaxLength} />
            )}
            <>{'行'}</>
          </FormItem>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(MultiRowText)
