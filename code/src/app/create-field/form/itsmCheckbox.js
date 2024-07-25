import React, { Component } from 'react'
import { Form, Checkbox, Tooltip } from '@uyun/components'
const FormItem = Form.Item

class ItsmCheckbox extends Component {
  render () {
    const { formItemLayout, item, getFieldDecorator, defaultValue } = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <Checkbox defaultChecked={defaultValue}>
            {item.label}
            {
              item.help &&
              <Tooltip title={item.helpTxt} getPopupContainer={() => document.getElementById('create-file-field')}>
                <i style={{ marginLeft: 10 }} className="uyicon uyicon-info-circle" />
              </Tooltip>
            }
          </Checkbox>
        )}
      </FormItem>
    )
  }
}

export default ItsmCheckbox
