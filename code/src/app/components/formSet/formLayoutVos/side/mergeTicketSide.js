import React, { Component } from 'react'
import { QuestionCircleOutlined } from '@uyun/icons'
import { Form, Input, InputNumber, Radio, Checkbox } from '@uyun/components'
const FormItem = Form.Item

class MergeTicketSide extends Component {
  handleCheckNum = (rules, value, callback) => {
    const { min, max } = rules
    if (value < min) {
      callback(`${i18n('ticket.forms.low', '不能低于')}100px`)
    } else if (value > max) {
      callback(`${i18n('ticket.forms.beyond', '不能超出')}1000px`)
    } else {
      callback()
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { isInLayout, sideData } = this.props
    const { height, mergeTicketFlag, deleteMergeTicketFlag, mergeActionType } = sideData

    return (
      <Form layout="vertical">
        {!isInLayout && (
          <FormItem label={i18n('ticket.relateTicket.title', '标题')}>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                    'ticket.relateTicket.title',
                    '标题'
                  )}`
                }
              ]
            })(
              <Input
                maxLength="32"
                placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                  'ticket.relateTicket.title',
                  '标题'
                )}`}
              />
            )}
          </FormItem>
        )}
        <FormItem label={i18n('default.state', '默认状态')}>
          {getFieldDecorator('fold')(
            <Radio.Group disabled={isInLayout}>
              <Radio.Button value={0}>{i18n('expand', '展开')}</Radio.Button>
              <Radio.Button value={1}>{i18n('collapsed', '收起')}</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem label={i18n('conf.model.basic.check', '基础校验')}>
          {getFieldDecorator('isRequired')(
            <Radio.Group>
              <Radio.Button value={0} disabled>
                {i18n('conf.model.field.optional', '选填')}
              </Radio.Button>
              <Radio.Button value={1} disabled>
                {i18n('conf.model.field.required', '必填')}
              </Radio.Button>
              <Radio.Button value={2} disabled>
                {i18n('conf.model.field.read-only', '只读')}
              </Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem label={i18n('model.controler.height', '控件高度')}>
          {getFieldDecorator('heightType', {
            initialValue: height === undefined ? 0 : Number(height) === 0 ? 0 : 1
          })(
            <Radio.Group>
              <Radio.Button value={0}>{i18n('self-adaption', '自适应')}</Radio.Button>
              <Radio.Button value={1}>{i18n('model.ticket.max.height', '设置上限')}</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        {Number(height) !== 0 && (
          <FormItem label={i18n('model.ticket.height.setting', '高度设置')}>
            {getFieldDecorator('height', {
              rules: [
                {
                  min: 100,
                  max: 1000,
                  validator: (rule, value, callback) => {
                    this.handleCheckNum(rule, value, callback)
                  }
                }
              ]
            })(
              <InputNumber
                placeholder={i18n('iframe.range.100-1000', '输入范围100~1000')}
                min={100}
                max={1000}
              />
            )}{' '}
            <span>px</span>
          </FormItem>
        )}
        <FormItem label="合并设置">
          {getFieldDecorator('mergeTicketFlag', {
            initialValue: mergeTicketFlag,
            valuePropName: 'checked'
          })(<Checkbox>{i18n('createMergeTicket1', '支持合并工单')}</Checkbox>)}
        </FormItem>
        <FormItem label="">
          {getFieldDecorator('deleteMergeTicketFlag', {
            initialValue: deleteMergeTicketFlag,
            valuePropName: 'checked'
          })(<Checkbox>{i18n('deleteMergeTicket1', '支持删除合并工单')}</Checkbox>)}
        </FormItem>
        <FormItem label="">
          {getFieldDecorator('mergeActionType', {
            initialValue: mergeActionType,
            valuePropName: 'checked'
          })(<Checkbox>主单完成触发脚本</Checkbox>)}
        </FormItem>
      </Form>
    )
  }
}

export default Form.create({
  mapPropsToFields: (props) => {
    const { name, fold, height, isRequired } = props.sideData || {}
    return {
      name: Form.createFormField({
        value: name
      }),
      fold: Form.createFormField({
        value: fold || 0
      }),
      isRequired: Form.createFormField({
        value: isRequired || 0
      }),
      height: Form.createFormField({
        value: height
      })
    }
  },
  onValuesChange: (props, changedValues, allValues) => {
    if (_.has(changedValues, 'heightType')) {
      changedValues.height =
        Number(changedValues.heightType) === 0
          ? 0
          : changedValues.height
          ? changedValues.height
          : 500
    }
    props.handleChange(changedValues)
  }
})(MergeTicketSide)
