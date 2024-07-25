import React, { Component } from 'react'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Modal, Form, Input, Switch, Radio } from '@uyun/components'
import { decrypt } from '../../../assets/utils'
const FormItem = Form.Item
const RadioGroup = Radio.Group

function noop () {
  return false
}

class UserModal extends Component {
    handleSubmit = e => {
      e.preventDefault()
      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.props.onOk(values)
        }
      })
    }

    checkRealname = (rule, value, callback) => {
      if (value.length < 2 || value.length > 20) {
        callback(i18n('validator_real_name_length', '姓名长度2~20个字符'))
      } else {
        callback()
      }
    }

    checkUsername = (rule, value, callback) => {
      var reg = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){2,11}$/
      if (!reg.test(value)) {
        callback(i18n('validator_user_name_ill', '必须以字母开头且只能包含字母、数字、下划线，3~12个字符'))
      } else {
        callback()
      }
    }

    checkPass = (rule, value, callback) => {
      if (value.length < 7 || value.length > 16) {
        callback(i18n('validator_password_length', '密码格式不正确，请输入7~16位密码,至少包含一个大写字母、一个小写字母、一个数字和一个特殊字符，不允许有空格'))
      } else {
        const reg = /^(?=^.{1,}$)(?=.*\d)(?=.*\W+)(?=.*[A-Z])(?=.*[a-z])(?!.*\n).*$/
        if (!value.match(reg)) {
          callback(i18n('validator_password_length'))
        } else {
          callback()
        }
      }
    }

    checkPass2 = (rule, value, callback) => {
      const { getFieldValue } = this.props.form
      if (value && value !== getFieldValue('password')) {
        callback(i18n('validator_password_same', '两次输入密码不一致！'))
      } else {
        callback()
      }
    }

    checkPhone = (rule, value, callback) => {
      if (!value) {
        callback()
      }
      const lang = runtimeStore.getState().language === 'zh_CN' ? 1 : 0
      var reg = lang ? /^1[34578]\d{9}$/ : /^([0-9-]*)$/
      var flag = reg.test(value)
      if (!flag) {
        callback(i18n('validator_phone_ill', '不符合手机校验规则'))
      } else {
        callback()
      }
    }

    render () {
      const { visible, type, data } = this.props
      const { getFieldDecorator } = this.props.form
      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 }
      }
      return (
        <Modal title={type === 'create' ? i18n('new_user', '新建用户') : i18n('edit_user', '编辑用户')}
          visible={visible}
          maskClosable={false}
          width={520}
          onCancel={this.props.onCancel}
          onOk={this.handleSubmit}
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem {...formItemLayout}
              label={i18n('real_name', '姓名')}
            >
              {getFieldDecorator('real_name', {
                initialValue: data ? data.real_name : null,
                validateFirst: true,
                rules: [
                  { required: true, message: i18n('validator_input_real_name', '请输入姓名') },
                  { validator: this.checkRealname }
                ]
              })(
                <Input placeholder={i18n('validator_input_real_name', '请输入姓名')} />
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={i18n('user_name', '用户名')}
            >
              {getFieldDecorator('user_name', {
                initialValue: data ? data.user_name : null,
                validateFirst: true,
                rules: [
                  { required: true, whitespace: true, message: i18n('validator_input_user_name', '请输入用户名') },
                  { validator: this.checkUsername }
                ]
              })(
                <Input placeholder={i18n('validator_input_user_name', '请输入用户名')} />
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={i18n('password', '密码')}
            >
              {getFieldDecorator('password', {
                initialValue: data ? decrypt(data.password) : null,
                validateFirst: true,
                rules: [
                  { required: true, whitespace: true, message: i18n('validator_input_password', '请输入密码') },
                  { validator: this.checkPass }
                ]
              })(
                <Input autoComplete="off" type="password"
                  placeholder={i18n('validator_input_password')}
                  onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} />
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={i18n('repassword', '确认密码')}
            >
              {getFieldDecorator('repassword', {
                initialValue: data ? decrypt(data.password) : null,
                validateFirst: true,
                rules: [
                  { required: true, whitespace: true, message: i18n('validator_input_password', '请输入密码') },
                  { validator: this.checkPass2 }
                ]
              })(
                <Input autoComplete="off" type="password"
                  placeholder={i18n('validator_password_keep_same', '两次输入密码保持一致')}
                  onContextMenu={noop} onPaste={noop} onCopy={noop} onCut={noop} />
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={i18n('email')}
            >
              {getFieldDecorator('email', {
                initialValue: data ? data.email : null,
                validateFirst: true,
                rules: [
                  { required: true, whitespace: true, message: i18n('validator_input_email', '请输入邮箱') },
                  { type: 'email', message: i18n('validator_input_right_email', '请输入正确的邮箱') }
                ]
              })(
                <Input type="email" placeholder={i18n('validator_input_email', '请输入邮箱')} />
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={i18n('sex', '性别')}
            >
              {getFieldDecorator('sex', {
                initialValue: data ? data.sex : 'male'
              })(
                <RadioGroup>
                  <Radio value="male">{i18n('male', '男')}</Radio>
                  <Radio value="female">{i18n('female', '女')}</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={i18n('phone', '手机号码')}
            >
              {getFieldDecorator('phone', {
                initialValue: data ? data.phone : null,
                rules: [
                  { validator: this.checkPhone }
                ]
              })(
                <Input type="phone" placeholder={i18n('validator_input_phone', '请输入手机号码')} />
              )}
            </FormItem>
            <FormItem {...formItemLayout}
              label={i18n('enabled_status', '启用状态')}
            >
              {getFieldDecorator('status', {
                initialValue: !!(data && data.status === 1),
                valuePropName: 'checked'
              })(
                <Switch checkedChildren={i18n('enable', '开启')}
                  unCheckedChildren={i18n('disable', '停用')} />
              )}
            </FormItem>
          </Form>
        </Modal>
      )
    }
}

export default Form.create()(UserModal)
