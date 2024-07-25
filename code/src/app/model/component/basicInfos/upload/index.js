import React, { Component } from 'react'
import { Form } from '@uyun/components'
import FileView from './fileView'
import '../styles/upload.less'
const FormItem = Form.Item

export default class UploadModel extends Component {
  setFormsValue = obj => {
    this.props.setFieldsValue && this.props.setFieldsValue({ modelIcon: obj })
  }

  render () {
    const { item, formItemLayout, getFieldDecorator, modelData = {} } = this.props
    return (
      <FormItem label={item.name} {...formItemLayout}>
        {
          getFieldDecorator('modelIcon', {
            initialValue: _.pick(modelData, ['iconName', 'fileId', 'fileName']),
            rules: [{
              required: item.required === 1
            }]
          })(<FileView setFormsValue={this.setFormsValue} />)
        }
      </FormItem>
    )
  }
}
