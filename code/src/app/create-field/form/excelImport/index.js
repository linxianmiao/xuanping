import React, { Component } from 'react'
import { Form, Tooltip, message } from '@uyun/components'
import ExcelColumn from './excelColumn'
import '../style/excelImport.less'
const FormItem = Form.Item

class Excel extends Component {
  render() {
    const { formItemLayout, getFieldDecorator, item, defaultValue } = this.props

    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue || undefined,
          rules: [{
            required: item.required === 1,
            message: '请导入 Excel 模板'
          }]
        })(
          <ExcelColumn
            action={API.upload_excel_field}
          />
        )}
      </FormItem>
    )
  }
}

export default Excel