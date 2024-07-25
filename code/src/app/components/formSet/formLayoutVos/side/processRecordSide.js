import React, { Component } from 'react'
import { QuestionCircleOutlined } from '@uyun/icons'
import { Form, Input, InputNumber, Radio, Tooltip } from '@uyun/components'
const FormItem = Form.Item

class ProcessRecordSide extends Component {
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
    const { isInLayout } = this.props
    const iconStyle = {
      marginLeft: 5,
      cursor: 'pointer'
    }
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

        {/* <FormItem
          label={
            <div>
              {i18n('iframe-header-setting', '边框设置')}
              <Tooltip title={i18n('iframe-header-setting-tip1', '是否展示控件的边框,预览时生效')}>
                <QuestionCircleOutlined style={iconStyle} />
              </Tooltip>
            </div>
          }
        >
          {getFieldDecorator(
            'styleAttribute',
            {}
          )(
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={0}>
                {i18n('conf.model.linkage.strategy.tip8', '隐藏')}
              </Radio.Button>
              <Radio.Button value={1}>
                {i18n('conf.model.linkage.strategy.tip7', '显示')}
              </Radio.Button>
            </Radio.Group>
          )}
        </FormItem> */}
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
              <Radio.Button value={2}>{i18n('conf.model.field.read-only', '只读')}</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
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
      </Form>
    )
  }
}

export default Form.create({
  mapPropsToFields: (props) => {
    const { name, styleAttribute, fold, height, isRequired } = props.sideData || {}
    return {
      name: Form.createFormField({
        value: name
      }),
      styleAttribute: Form.createFormField({
        value: styleAttribute
      }),
      fold: Form.createFormField({
        value: fold || 0
      }),
      isRequired: Form.createFormField({
        value: isRequired || 2
      }),
      height: Form.createFormField({
        value: height
      })
    }
  },
  onValuesChange: (props, changedValues, allValues) => {
    props.handleChange(changedValues)
  }
})(ProcessRecordSide)
