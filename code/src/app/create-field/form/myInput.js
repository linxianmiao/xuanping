import React, { Component } from 'react'
import { Form, Input, Checkbox, Row, Col } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import disCode from '../config/disCode'
const FormItem = Form.Item
const { TextArea } = Input
@inject('globalStore')
@observer
class ITSMInput extends Component {
  handleCheckSingleRowText = (item, rule, value, callback) => {
    const codeReg = /^[a-zA-Z]+$/
    const myReg = /^([\u4e00-\u9fa5a-zA-Z0-9 ]+)$/
    const { filterNamesByRegular } = this.props.globalStore
    if (!_.trim(value) && item.required) {
      callback(`${i18n('ticket.forms.pinput', '请输入')}${item.name}`)
    } else {
      if (item.code === 'name' && !myReg.test(value) && filterNamesByRegular) {
        callback(i18n('field_create_name_error', '不能包含特殊字符'))
      }
      if (item.code === 'code' && !codeReg.test(value)) {
        callback(i18n('field_create_code_error', '编码只能为英文'))
      }
      if (item.code === 'code' && _.includes(disCode, value)) {
        callback(i18n('field_create_code_error2', '编码与内置编码冲突'))
      }
      if (rule.max && value.length > rule.max) {
        callback(
          `${i18n('ticket.forms.beyond', '不能超出')}${rule.max}${i18n(
            'ticket.forms.character',
            '字符'
          )}`
        )
      } else if (rule.min && value.length < rule.min) {
        callback(
          `${i18n('ticket.forms.below', '不能低于')}${rule.min}${i18n(
            'ticket.forms.character',
            '字符'
          )}`
        )
      } else {
        callback()
      }
    }
  }

  allowEditing = () => {
    let flag = false
    const { code } = this.props.item
    const { id } = this.props.fieldData || {}
    if (id) {
      if (code === 'code') {
        flag = true
      }
    }
    return flag
  }

  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, type, source } = this.props
    const { placeholder } = this.props.fieldData
    const disabled = this.allowEditing()

    return (
      <div>
        {
          <FormItem {...formItemLayout} label={item.name}>
            {getFieldDecorator(item.code, {
              initialValue: defaultValue || '',
              validateFirst: true,
              rules: [
                {
                  type: 'string',
                  whitespace: true,
                  required: item.required === 1,
                  min: item.minLength ? item.minLength : null,
                  max: item.maxLength && item.maxLength > item.minLength ? item.maxLength : null,
                  validator: (rule, value, callback) => {
                    this.handleCheckSingleRowText(item, rule, value, callback)
                  }
                }
              ]
            })(
              item.type === 'textarea' ? (
                <TextArea
                  autosize={{ minRows: 2, maxRows: 6 }}
                  disabled={disabled}
                  type={type}
                  maxLength={item.maxLength}
                />
              ) : (
                <Input
                  maxLength={item.maxLength}
                  disabled={disabled}
                  type={type}
                  style={item.style}
                />
              )
            )}
          </FormItem>
        }

        {source === 'dataBase'
          ? type === 'singleRowText' &&
            item.code === 'fieldDesc' && (
              <Row style={{ margin: '-18px 0 20px' }}>
                <Col {...formItemLayout.labelCol} />
                <Col {...formItemLayout.wrapperCol}>
                  {getFieldDecorator('placeholder', {
                    initialValue: placeholder,
                    valuePropName: 'checked',
                    getValueFromEvent: (e) => (e.target.checked ? 1 : 0)
                  })(<Checkbox>{'工单显示字段说明'}</Checkbox>)}
                </Col>
              </Row>
            )
          : (type === 'singleRowText' || type === 'multiRowText' || type === 'richText') &&
            item.code === 'fieldDesc' && (
              <Row style={{ margin: '-18px 0 20px' }}>
                <Col {...formItemLayout.labelCol} />
                <Col {...formItemLayout.wrapperCol}>
                  {getFieldDecorator('placeholder', {
                    initialValue: placeholder,
                    valuePropName: 'checked',
                    getValueFromEvent: (e) => (e.target.checked ? 1 : 0)
                  })(<Checkbox>{i18n('expected.value.hint', '预期值提示')}</Checkbox>)}
                </Col>
              </Row>
            )}
      </div>
    )
  }
}

export default ITSMInput
