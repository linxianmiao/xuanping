import React, { Component } from 'react'
import { Form, Row, Col, Input, Select, Checkbox } from '@uyun/components'
import { __ } from 'ramda'

import './styles/parallel.less'

const FormItem = Form.Item
const Option = Select.Option

class Parallel extends Component {
  handleCheckInput = (item, rule, value, callback) => {
    if (!value) {
      callback(`${i18n('ticket.forms.pinput', '请输入')}${item.name}`)
      return
    }
    // 去掉限制，并限制空白字符的输入
    if (/\s/.test(value)) {
      callback((i18n('conf.model.notblank', '不能输入空白字符')))
    }
    if (rule.max && value.length > rule.max) {
      callback(`${i18n('ticket.forms.beyond', '不能高于')}${rule.max}${i18n('ticket.forms.character', '字符')}`)
    } else if (rule.min && value.length < rule.min) {
      callback(`${i18n('ticket.forms.below', '不能低于')}${rule.min}${i18n('ticket.forms.character', '字符')}`)
    } else {
      callback()
    }
  }

  render() {
    const { item, getFieldDecorator, modelData, getFieldValue } = this.props
    const children = item.children
    return (
      <>
        <Row>
          <Col span={3} className="u4-form-item-label">
            <label className="u4-form-item-required">{item.name}</label>
          </Col>
          <Col span={15}>
            <Row>
              {
                children.map(child => {
                  if (child.type === 'input') {
                    return (
                      <Col span="6" key={child.code}>
                        <FormItem>
                          {getFieldDecorator(child.code, {
                            initialValue: (modelData && modelData[child.code]) || undefined,
                            rules: [{
                              required: true,
                              min: child.minLength ? child.minLength : null,
                              max: child.maxLength && child.maxLength > child.minLength ? child.maxLength : null,
                              validator: (rule, value, callback) => { this.handleCheckInput(child, rule, value, callback) }
                            }]
                          })(
                            <Input
                              size="default"
                              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${item.name}`}
                            />
                          )}
                        </FormItem>
                      </Col>
                    )
                  }

                  // 选择无日期时，不显示选择重置模式
                  if (child.code === 'ruleRestMode' && getFieldValue('ruleTime') === '0') {
                    return (
                      <Col span="5" offset={1} key={child.code}>
                        <FormItem>
                          {getFieldDecorator(child.code, {
                            initialValue: (modelData && modelData[child.code]) || undefined
                          })(
                            <div />
                          )}
                        </FormItem>
                      </Col>
                    )
                  }

                  if (child.type === 'select') {
                    let options = child.params.slice()
                    // 选择无日期时，流水号才可选八位流水号
                    if (child.code === 'ruleLength') {
                      if (getFieldValue('ruleTime') === '0') {
                        options = options.slice(2)
                      } else {
                        options = options.slice(0, 2)
                      }
                    }

                    return (
                      <Col span="5" offset={1} key={child.code}>
                        <FormItem>
                          {getFieldDecorator(child.code, {
                            initialValue: (modelData && modelData[child.code]) || undefined
                          })(
                            <Select
                              notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
                              size="default"
                              style={{ width: '100%' }}
                              placeholder={`${i18n('ticket.forms.select', '请选择')}${child.name}`}>
                              {_.map(options, (param, i) => {
                                return (
                                  <Option key={i} value={param.key}>
                                    { param.label}
                                  </Option>
                                )
                              })}
                            </Select>
                          )}
                        </FormItem>
                      </Col>
                    )
                  }
                })
              }
            </Row>
          </Col>
        </Row>
        <Row style={{ marginBottom: '16px' }}>
          <Col span={3}>{' '}</Col>
          <Col span={15}>
            <Row>
              <Col span={24} className='prepose-content'>
                <FormItem style={{ display: 'inline-block' }}>
                  {
                    getFieldDecorator('preposeSwitch', {
                      initialValue: modelData.preposeText ? true : false,
                      valuePropName: 'checked',
                      rules: [{ type: 'boolean' }]
                    })(<Checkbox>{`${i18n('conf.model.preposeEnable', '开启前置')}`}</Checkbox>)
                  }
                </FormItem>
                {
                  getFieldValue('preposeSwitch')
                    ?
                    <FormItem className='prepose-prepose-text'>
                    {
                      getFieldDecorator('preposeText', {
                        initialValue: modelData.preposeText || undefined,
                        rules: [
                          {
                            required: true,
                            message: `${i18n('ticket.forms.pinput', '请输入')}${i18n('conf.model.preposeText', '前置文本')}`
                          }
                        ]
                      })(<Input  placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('conf.model.preposeText', '前置文本')}`}/>)
                    }
                    </FormItem>
                    : null
                }
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    )
  }
}

export default Parallel
