import React, { Component } from 'react'
import { Form, Input, Radio } from '@uyun/components'
import ShareSelect from './ShareSelect'
const FormItem = Form.Item
const RadioGroup = Radio.Group

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 }
}
@Form.create()
export default class TempForm extends Component {
  getCurrentIsShared = () => {
    const valueInForm = this.props.form.getFieldValue('isShared')

    return valueInForm === undefined ? this.props.tempData.isShared : valueInForm
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { templateName, isShared, shareRanges, staffVOS, desc } = this.props.tempData
    const namePlaceholder = i18n('ticket.forms.pinput', '请输入') + i18n('template', '模板', { name: i18n('conf.model.field.card.name', '名称') })
    const descPlaceholder = i18n('ticket.forms.pinput', '请输入') + i18n('template', '模板', { name: i18n('conf.model.field.card.desc', '描述') })
    return (
      <Form style={{ marginTop: 24 }}>
        <FormItem {...formItemLayout} label={i18n('template', '模板', { name: i18n('conf.model.field.card.name', '名称') })}>
          {getFieldDecorator('templateName', {
            initialValue: templateName,
            rules: [
              { required: true, message: namePlaceholder }
            ]
          })(
            <Input
              allowClear
              maxLength={20}
              placeholder={namePlaceholder}
            />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('ticket-template-share', '共享设置')}>
          {getFieldDecorator('isShared', {
            initialValue: isShared || 0
          })(
            <RadioGroup>
              <Radio value={0}>{i18n('no', '否')}<span className="ticket-template-share-tip">(仅自己使用)</span></Radio>
              <Radio value={1}>{i18n('yes', '是')}<span className="ticket-template-share-tip">(分享给其他用户使用)</span></Radio>
            </RadioGroup>
          )}
        </FormItem>
        { // 分享给其他用户时
          this.getCurrentIsShared() === 1 && (
            <FormItem {...formItemLayout} label={i18n('share.user', '共享用户')}>
              {getFieldDecorator('shareRanges', {
                initialValue: shareRanges || {},
                rules: [{
                  validator: (rule, value, callback) => {
                    const { all, group, department, role } = value
                    if (!all && _.isEmpty(group) && _.isEmpty(department) && _.isEmpty(role)) {
                      callback(i18n('please.select.user', '请选择用户'))
                    } else {
                      callback()
                    }
                  }
                }]
              })(
                <ShareSelect selectedUserInfo={staffVOS} />
              )}
            </FormItem>
          )
        }
        <FormItem {...formItemLayout} label={i18n('template', '模板', { name: i18n('conf.model.field.card.desc', '描述') })}>
          {getFieldDecorator('desc', {
            initialValue: desc
          })(
            <Input.TextArea
              maxLength={50}
              placeholder={descPlaceholder}
            />
          )}
        </FormItem>
      </Form>
    )
  }
}
