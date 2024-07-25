import React, { Component } from 'react'
import { Form, Input } from '@uyun/components'
import UserPicker from '~/components/userPicker'

class MultiPerformerForm extends Component {
  render() {
    const { messageName, messageStatus } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form layout="vertical">
        <Form.Item label={'选择会签人'} required>
          {getFieldDecorator('addPerformers', {
            initialValue: undefined,
            rules: [
              {
                required: true,
                message: '请选择会签人'
              }
            ]
          })(<UserPicker tabs={[1]} showTypes={['users']} />)}
        </Form.Item>
        {messageStatus === 2 ? null : (
          <Form.Item label={messageName || i18n('ticket.detail.opinion', '意见')}>
            {getFieldDecorator('message', {
              rules: [
                {
                  required: +messageStatus === 1,
                  message: i18n('please-input', '请输入')
                }
              ]
            })(<Input.TextArea autosize={{ minRows: 4, maxRows: 4 }} />)}
          </Form.Item>
        )}
      </Form>
    )
  }
}

export default Form.create()(MultiPerformerForm)
