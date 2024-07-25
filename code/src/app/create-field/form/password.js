import React, { Component } from 'react'
import { Form, Input } from '@uyun/components'
import './style/password.less'
const FormItem = Form.Item
class Password extends Component {
    state = {
      type: 'password'
    }

    handleClick = () => {
      this.setState(prveState => ({
        type: prveState.type === 'password' ? 'text' : 'password'
      }))
    }

    handleCheckPwd = (item, rule, value, callback) => {
      value = value ? _.trim(value) : ''
      if (!value && item.required) {
        callback(`${i18n('ticket.forms.pinput', '请输入')}${item.name}`)
      }
      callback()
    }

    render () {
      const { formItemLayout, getFieldDecorator, item, defaultValue } = this.props
      const { type } = this.state
      return (
        <FormItem className="new-itsm-create-field-pwd-wrap" {...formItemLayout} label={i18n('default_value', '默认值')}>
          {getFieldDecorator('defaultValue', {
            initialValue: defaultValue,
            rules: [{
              validator: (rule, value, callback) => { this.handleCheckPwd(item, rule, value, callback) }
            }]
          })(
            <Input type={type} />
          )}
          {
            type === 'password'
              ? <i onClick={this.handleClick} className="icon-yinjianhui iconfont" />
              : <i onClick={this.handleClick} className="icon-biyan iconfont" />
          }
        </FormItem>
      )
    }
}

export default Password
