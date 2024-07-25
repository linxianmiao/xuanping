import React, { Component } from 'react'
import { Form, Tooltip, Radio } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import TriggerRules from '../components/triggerRules'
import { checkTriggerConditionValue } from '../components/common/checkTriggerConditionValue'
import TriggerEventSelect from './components/triggerEventSelect'
import _ from 'lodash'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
@inject('basicStore')
@observer
class ConditionForm extends Component {
  // 校验数据
  validateForms = () => {
    return new Promise((resolve, reject) => {
      this.props.form.validateFieldsAndScroll((errors, values) => {
        if (errors) reject(new Error(''))
        const condition = values[`${this.props.code}Condition`]
        const falt = checkTriggerConditionValue(condition)
        if (falt) {
          resolve(values)
        }
        this.props.form.setFields({
          [`${this.props.code}Condition`]: {
            value: condition,
            errors: [new Error()]
          }
        })
        reject(new Error())
      })
    })
  }

  // 修改工单模型类型后，重置 开始/结束 条件
  reset = () => {
    const { code } = this.props
    const { setFieldsValue } = this.props.form

    setFieldsValue({
      [`${code}EventType`]: undefined,
      [`${code}Incident`]: undefined
    })
  }

  // 选择 开始/结束 条件的同时，设置额外的表单值
  handleSelectTriggerEvent = data => {
    const { code } = this.props
    const { setFieldsValue } = this.props.form

    setFieldsValue({
      [`${code}EventType`]: data.type
    })
  }

  resetIncident = () => {
    const { code } = this.props
    const { setFieldsValue } = this.props.form
    setFieldsValue({ [`${code}Incident`]: undefined })
  }

  render() {
    const { getFieldDecorator, getFieldError, getFieldValue } = this.props.form
    const {
      list,
      title,
      desc,
      formItemLayout,
      formItemLayout1,
      code,
      incident,
      condition,
      modelId,
      eventType
    } = this.props
    const { timeFields } = this.props.basicStore
    return (
      <Form>
        <FormItem {...formItemLayout} label={title}>
          {getFieldDecorator(`${code}EventType`, {
            initialValue: eventType || 0,
            rules: [{ required: true, message: `${i18n('globe.select', '请选择')}${title}` }]
          })(
            <RadioGroup buttonStyle="solid" onChange={this.resetIncident}>
              <RadioButton key={0} value={0}>
                {i18n('policy.incident.response')}
              </RadioButton>
              <RadioButton key={1} value={1} disabled={timeFields.length === 0}>
                {i18n('form.entry')}
              </RadioButton>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem {...formItemLayout1} label="">
          {getFieldDecorator(`${code}Incident`, {
            initialValue: incident || undefined,
            rules: [{ required: true, message: `${i18n('globe.select', '请选择')}${title}` }]
          })(
            <TriggerEventSelect
              type={getFieldValue(`${code}EventType`)}
              data={list}
              timeFields={timeFields}
              onSelect={this.handleSelectTriggerEvent}
            />
          )}
          <Tooltip title={desc}>
            <i className="iconfont icon-bangzhu" />
          </Tooltip>
        </FormItem>

        {modelId && (
          <FormItem {...formItemLayout1} help="" validateStatus="success">
            {getFieldDecorator(`${code}Condition`, {
              initialValue: condition || {
                when: 'all',
                conditionExpressions: [],
                nestingConditions: []
              },
              rules: [{ type: 'object' }]
            })(
              <TriggerRules
                excludeVariable
                modelId={modelId}
                isError={getFieldError(`${code}Condition`)}
                excludeCodes={['modelId']}
              />
            )}
          </FormItem>
        )}
      </Form>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange(true)
  }
})(ConditionForm)
