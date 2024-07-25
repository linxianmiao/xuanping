import React, { Component } from 'react'
import { Form, Input, InputNumber, Radio, Tooltip, Select } from '@uyun/components'
import { QuestionCircleOutlined } from '@uyun/icons'
import LinkUrl from '../components/linkUrl'
import CopyInput from '../components/cpoyInput'
const FormItem = Form.Item
const Option = Select.Option

class IframeSilder extends Component {
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
    const {
      name,
      id,
      mode,
      linkUrl,
      viewEditVo,
      verificationWay,
      styleAttribute,
      height,
      ifPrivacy
    } = this.props.sideData
    const { viewUrl, editUrl } = viewEditVo || {}
    const iconStyle = {
      marginLeft: 5,
      cursor: 'pointer'
    }
    return (
      <Form layout="vertical">
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

        <FormItem label={i18n('conf.model.field.code', '编码')}>
          <Input
            value={id}
            disabled
            addonAfter={
              <>
                <CopyInput id={id} />
              </>
            }
          />
        </FormItem>

        <FormItem label={i18n('ticket.relateTicket.url.radio', 'url')}>
          {getFieldDecorator('mode', {
            rules: [{ required: true }]
          })(
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={0}>
                {i18n('ticket.relateTicket.url.radio0', '默认')}
              </Radio.Button>
              <Radio.Button value={1}>
                {i18n('ticket.relateTicket.url.radio1', '编辑与查看')}
              </Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        {mode === 1 && (
          <FormItem label={i18n('ticket.relateTicket.viewUrl', '查看url')}>
            {getFieldDecorator('viewUrl', {
              rules: [
                {
                  required: mode === 1,
                  message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                    'ticket.relateTicket.viewUrl',
                    '查看url'
                  )}`
                }
              ]
            })(<LinkUrl />)}
          </FormItem>
        )}
        {mode === 1 && (
          <FormItem label={i18n('ticket.relateTicket.editUrl', '编辑url')}>
            {getFieldDecorator('editUrl', {
              rules: [
                {
                  required: mode === 1,
                  message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                    'ticket.relateTicket.editUrl',
                    '编辑url'
                  )}`
                }
              ]
            })(<LinkUrl />)}
          </FormItem>
        )}
        {mode === 0 && (
          <FormItem label={i18n('ticket.relateTicket.url', '访问url')}>
            {getFieldDecorator('linkUrl', {
              rules: [
                {
                  required: mode === 0,
                  message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                    'ticket.relateTicket.url',
                    '访问url'
                  )}`
                }
              ]
            })(<LinkUrl />)}
          </FormItem>
        )}
        <FormItem
          label={
            <div>
              {i18n('iframe-event-notification', '事件通知')}
              <Tooltip
                title={
                  <div>
                    <p>
                      {i18n(
                        'iframe-event-notification-tip0',
                        '提交后:工单提交成功以后给iframe控件发送信息'
                      )}
                    </p>
                    <p>
                      {i18n(
                        'iframe-event-notification-tip1',
                        '提交前:工单准备提交时iframe控件发送信息,接收到iframe控件返回的正确信息后才开始提交工单'
                      )}
                    </p>
                  </div>
                }
              >
                <QuestionCircleOutlined style={iconStyle} />
              </Tooltip>
            </div>
          }
        >
          {getFieldDecorator(
            'verificationWay',
            {}
          )(
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={0}>{i18n('iframe-event-notification0', '提交后')}</Radio.Button>
              <Radio.Button value={1}>{i18n('iframe-event-notification1', '提交前')}</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>

        <FormItem
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
        </FormItem>
        <FormItem label={i18n('default.state', '默认状态')}>
          {getFieldDecorator('fold')(
            <Radio.Group>
              <Radio.Button value={0}>{i18n('expand', '展开')}</Radio.Button>
              <Radio.Button value={1}>{i18n('collapsed', '收起')}</Radio.Button>
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
          })(<InputNumber placeholder={i18n('iframe.range.100-1000', '输入范围100~1000')} />)}{' '}
          <span>px</span>
        </FormItem>

        <FormItem label={i18n('field_value_privacy', '隐私')}>
          {getFieldDecorator(
            'ifPrivacy',
            {}
          )(
            <Select style={{ width: '100%' }}>
              <Option value={0}>{i18n('field_value_no_privacy', '无隐私设置')}</Option>
              <Option value={1}>{i18n('field_value_excutorSee', '仅当前工单处理人可见')}</Option>
              <Option value={2}>{i18n('privacy_helpTxt', '仅当前工单经办人员可见')}</Option>
            </Select>
          )}
        </FormItem>
      </Form>
    )
  }
}

export default Form.create({
  mapPropsToFields: (props) => {
    const {
      name,
      mode,
      linkUrl,
      viewEditVo,
      verificationWay,
      styleAttribute,
      fold,
      height,
      ifPrivacy
    } = props.sideData || {}
    const { viewUrl, editUrl } = viewEditVo || {}
    return {
      name: Form.createFormField({
        value: name
      }),
      mode: Form.createFormField({
        value: mode
      }),
      linkUrl: Form.createFormField({
        value: linkUrl
      }),
      viewUrl: Form.createFormField({
        value: viewUrl
      }),
      editUrl: Form.createFormField({
        value: editUrl
      }),
      verificationWay: Form.createFormField({
        value: verificationWay
      }),
      styleAttribute: Form.createFormField({
        value: styleAttribute
      }),
      fold: Form.createFormField({
        value: fold || 0
      }),
      height: Form.createFormField({
        value: height
      }),
      ifPrivacy: Form.createFormField({
        value: ifPrivacy || 0
      })
    }
  },
  onValuesChange: (props, changedValues, allValues) => {
    const { viewEditVo = {} } = props.sideData || {}
    for (const key in changedValues) {
      if (_.includes(['viewUrl', 'editUrl'], key)) {
        viewEditVo[key] = changedValues[key]
        props.handleChange(viewEditVo)
      } else {
        props.handleChange(changedValues)
      }
    }
  }
})(IframeSilder)
