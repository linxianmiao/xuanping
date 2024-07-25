import React, { Component } from 'react'
import { Form, Input } from '@uyun/components'
import SelectIndex from './SelectIndex'
import UserPicker from '~/components/userPicker'
const FormItem = Form.Item
const TextArea = Input.TextArea

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 }
}
@Form.create()
export default class EditCard extends Component {
  render() {
    const { name, description, childCode, disabled, layoutInfo, authorizedUsers } = this.props
    const { getFieldDecorator } = this.props.form
    return (
      <Form className="field-card-edit-form">
        <FormItem {...formItemLayout} label={i18n('conf.model.field.card.name', '名称')}>
          {getFieldDecorator('name', {
            initialValue: name,
            rules: [
              {
                required: true,
                validator: (rule, value, callback) => {
                  if (_.isEmpty(_.trim(value))) {
                    callback(
                      `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                        'conf.model.field.card.name',
                        '名称'
                      )}`
                    )
                  } else {
                    callback()
                  }
                }
              }
            ]
          })(
            <Input
              maxLength={20}
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                'conf.model.field.card.name',
                '名称'
              )}`}
            />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={i18n('permission-code', '编码')}>
          {getFieldDecorator('childCode', {
            initialValue: childCode,
            rules: [
              {
                required: true,
                validator: (rule, value, callback) => {
                  const reg = /^[a-zA-Z0-9_]+$/
                  if (_.isEmpty(value)) {
                    callback(
                      `${i18n('ticket.forms.pinput', '请输入')}${i18n('permission-code', '编码')}`
                    )
                  } else if (!reg.test(value)) {
                    callback(i18n('code-reg-error', '编码只能包含字母、数字、下划线'))
                  } else {
                    callback()
                  }
                }
              }
            ]
          })(
            <Input
              maxLength={30}
              disabled={disabled}
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                'permission-code',
                '编码'
              )}`}
            />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={i18n('conf.model.layoutId', '分组')}>
          {getFieldDecorator('layoutId', {
            initialValue: layoutInfo ? { key: layoutInfo.id, label: layoutInfo.name } : undefined,
            rules: [
              {
                required: true,
                message: i18n('pls_select_group', '请选择分组')
              }
            ]
          })(
            <SelectIndex
              onSelect={this.props.onSelect}
              placeholder={i18n('pls_select_group', '请选择分组')}
            />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={i18n('conf.model.usersAndGroup', '授权用户')}>
          {getFieldDecorator('authorizedUsers', {
            initialValue: authorizedUsers
          })(
            <UserPicker
              onChange={this.onChange}
              tabs={[0, 1, 2]}
              showTypes={['users', 'groups', 'departs_custom']}
            />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={i18n('conf.model.field.card.desc', '描述')}>
          {getFieldDecorator('description', {
            initialValue: description
          })(
            <TextArea
              maxLength={50}
              autosize={{ minRows: 2, maxRows: 6 }}
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                'conf.model.field.card.desc',
                '描述'
              )}`}
            />
          )}
        </FormItem>
      </Form>
    )
  }
}
