import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input, InputNumber, Radio } from '@uyun/components'
import { i18n } from '@uyun/utils'

const FormItem = Form.Item

@inject('formSetGridStore')
@observer
class RelateSubProcessSide extends Component {
  state = {
    subProcessList: [],
    visible: false
  }

  async componentDidMount() {
    const { modelId } = this.props
    const params = {
      pageNum: 1,
      pageSize: 100,
      using: 1,
      type: 3,
      modelId: modelId
    }
    if (!modelId) return false
    const res = await axios.get(API.getProcessChartList, { params })
    this.setState({ subProcessList: res.list || [] })
  }

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
    const { sideData } = this.props
    const {
      name,

      styleAttribute,
      fold,
      height
    } = sideData
    return (
      <>
        <Form layout="vertical">
          <FormItem label={i18n('ticket.relateTicket.title', '标题')}>
            {getFieldDecorator('name', {
              initialValue: name || '关联子流程',
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
          {/* <FormItem label={i18n('ticket.control.style', '控件样式')}>
            {getFieldDecorator('styleAttribute', {
              initialValue: styleAttribute === undefined ? 1 : styleAttribute
            })(
              <Radio.Group>
                <Radio.Button value={0}>{i18n('ticket.control.noborder', '无边框')}</Radio.Button>
                <Radio.Button value={1}>{i18n('ticket.control.hasborder', '有边框')}</Radio.Button>
              </Radio.Group>
            )}
          </FormItem> */}
          <FormItem label={i18n('default.state', '默认状态')}>
            {getFieldDecorator('fold', {
              initialValue: fold === undefined ? 0 : fold
            })(
              <Radio.Group>
                <Radio.Button value={0}>{i18n('expand', '展开')}</Radio.Button>
                <Radio.Button value={1}>{i18n('collapsed', '收起')}</Radio.Button>
              </Radio.Group>
            )}
          </FormItem>
          {/* <FormItem label={i18n('conf.model.basic.check', '基础校验')}>
            {getFieldDecorator('isRequired')(
              <Radio.Group>
                <Radio.Button value={0}>{i18n('conf.model.field.optional', '选填')}</Radio.Button>
                <Radio.Button value={1}>{i18n('conf.model.field.required', '必填')}</Radio.Button>
                <Radio.Button value={2}>{i18n('conf.model.field.read-only', '只读')}</Radio.Button>
              </Radio.Group>
            )}
          </FormItem> */}
          {/* <FormItem label={i18n('model.ticket.max.height', '设置上限')}>
            {getFieldDecorator('height', {
              initialValue: height || 500
            })(
              <InputNumber
                maxLength="32"
                placeholder={`${i18n('ticket.forms.pinput', '请输入')}`}
              />
            )}
            {'  '}
            <span>px</span>
          </FormItem> */}
        </Form>
      </>
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
        value: isRequired || 0
      }),
      height: Form.createFormField({
        value: height
      })
    }
  },
  onValuesChange: (props, changedValues, allValues) => {
    props.handleChange(changedValues)
  }
})(RelateSubProcessSide)
