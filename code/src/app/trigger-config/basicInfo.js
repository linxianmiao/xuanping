import React, { Component, Fragment } from 'react'
import { Form, Input, Radio } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import { formItemLayout } from './config/config'

const FormItem = Form.Item

@inject('triggerStore')
@observer
export default class BasicInfo extends Component {
  changeType = e => {
    this.props.triggerStore.getActionListByType(e.target.value)
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { name, description, triggerType } = this.props.triggerStore.trigger
    return (
      <Fragment>
        <FormItem {...formItemLayout} label={i18n('trigger-name', '触发器名称')}>
          {getFieldDecorator('name', {
            initialValue: name,
            rules: [{
              required: true,
              whitespace: true,
              message: `${i18n('ticket.forms.pinput', '请输入')}${i18n('trigger-name', '触发器名称')}`
            }]
          })(
            <Input
              maxLength={20}
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('trigger-name', '触发器名称')}`} />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={i18n('trigger-desc', '触发器描述')}>
          {getFieldDecorator('description', {
            initialValue: description,
            rules: [{
              required: true,
              whitespace: true,
              message: `${i18n('ticket.forms.pinput', '请输入')}${i18n('trigger-desc', '触发器描述')}`
            }]
          })(
            <Input.TextArea
              maxLength={500}
              autosize={{ minRows: 2, maxRows: 6 }}
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('trigger-desc', '触发器描述')}`} />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={i18n('trigger-type', '触发器类型')}>
          {getFieldDecorator('triggerType', {
            initialValue: triggerType || '1',
            rules: [{
              required: true
            }]
          })(
            <Radio.Group buttonStyle="solid" onChange={this.changeType}>
              <Radio.Button value="1">{i18n('trigger-type-value1', '事件触发')} </Radio.Button>
              <Radio.Button value="2">{i18n('trigger-type-value2', '时间触发')}  </Radio.Button>
            </Radio.Group>
          )}&nbsp;&nbsp;
          {i18n('trigger-type-tip1', '触发器只支持一种触发类型生效，更换触发类型后将重置触发器内容配置')}
        </FormItem>
      </Fragment>
    )
  }
}
