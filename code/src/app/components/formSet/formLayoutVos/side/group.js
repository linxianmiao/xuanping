import React, { Component } from 'react'
import { Form, Input, Radio } from '@uyun/components'
import CopyInput from '../components/cpoyInput'
const FormItem = Form.Item
const { TextArea } = Input
const RadioGroup = Radio.Group

class GroupSilder extends Component {
  render() {
    const { getFieldDecorator } = this.props.form
    const { id } = this.props.sideData
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
        <FormItem label={i18n('default.state', '默认状态')}>
          {getFieldDecorator('fold')(
            <Radio.Group>
              <Radio.Button value={0}>{i18n('expand', '展开')}</Radio.Button>
              <Radio.Button value={1}>{i18n('collapsed', '收起')}</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem label={i18n('conf.model.linkage.strategy.tip1', '可见性')}>
          {getFieldDecorator(
            'hidden',
            {}
          )(
            <RadioGroup>
              <Radio.Button value={0}>{i18n('conf.model.field.tip2', '可见')}</Radio.Button>
              <Radio.Button value={1}>{i18n('conf.model.field.tip3', '隐藏')}</Radio.Button>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label={i18n('conf.model.field.card.desc', '描述')}>
          {getFieldDecorator(
            'description',
            {}
          )(
            <TextArea
              maxLength="500"
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

export default Form.create({
  mapPropsToFields: (props) => {
    let { name, description, fold, hidden } = props.sideData || {}
    if (hidden === null) {
      hidden = 0
    } else {
      hidden = hidden ? 1 : 0
    }

    return {
      name: Form.createFormField({
        value: name
      }),
      description: Form.createFormField({
        value: description
      }),
      fold: Form.createFormField({
        value: fold || 0
      }),
      hidden: Form.createFormField({
        value: hidden
      })
    }
  },
  onValuesChange: (props, changedValues, allValues) => {
    for (const key in changedValues) {
      if (key === 'hidden') {
        props.handleChange({
          hidden: !!changedValues[key]
        })
      } else {
        props.handleChange(changedValues)
      }
    }
    // props.handleChange(allValues)
  }
})(GroupSilder)
