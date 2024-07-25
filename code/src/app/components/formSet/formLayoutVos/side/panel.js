import React, { Component } from 'react'
import { Form, Input, Radio, InputNumber } from '@uyun/components'
import CopyInput from '../components/cpoyInput'
const FormItem = Form.Item
const { TextArea } = Input

class PanelSilder extends Component {
  render() {
    const { getFieldDecorator } = this.props.form
    const { height = 0 } = this.props.sideData
    return (
      <Form layout="vertical">
        <FormItem label="边框">
          {getFieldDecorator('styleAttribute')(
            <Radio.Group>
              <Radio.Button value={1}>显示</Radio.Button>
              <Radio.Button value={0}>隐藏</Radio.Button>
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
                  min: 50,
                  max: 1000,
                  validator: (rule, value, callback) => {
                    this.handleCheckNum(rule, value, callback)
                  }
                }
              ]
            })(<InputNumber min={50} max={1000} />)}{' '}
            <span>px</span>
          </FormItem>
        )}
      </Form>
    )
  }
}

export default Form.create({
  mapPropsToFields: (props) => {
    const { height, styleAttribute } = props.sideData || {}
    return {
      styleAttribute: Form.createFormField({
        value: styleAttribute === undefined ? 1 : styleAttribute
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
})(PanelSilder)
