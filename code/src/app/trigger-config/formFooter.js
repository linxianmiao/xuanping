import React, { Component } from 'react'
import { Form, Button } from '@uyun/components'

const FormItem = Form.Item

export default class FormFooter extends Component {
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return
    })
  }

  render() {
    return (
      <FormItem wrapperCol={{ offset: 2 }} className="footer">
        <Button type="primary" onClick={this.handleSave}>
          {i18n('save')}
        </Button>
        <Button type="primary">{i18n('test', '测试')}</Button>
        <Button>{i18n('cancel', '取消')}</Button>
      </FormItem>
    )
  }
}
