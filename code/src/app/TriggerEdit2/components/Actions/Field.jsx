import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Form, Select } from '@uyun/components'
import User from '~/trigger/component/triggerRule/user'
import AddVar from '~/trigger/component/triggerRule/addVar'
import Headers from './Widgets/Headers'
import Body from './Widgets/Body'
import ConfigTicket from '../ConfigTicket'
import CreateTicket from '../CreateTicket'
import { validateRequired } from '../../logic'
import './index.less'

const Option = Select.Option
const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
}

@inject('triggerStore', 'triggerIndexStore')
@observer
class Field extends Component {
  getFormItemValidateInfo = (value, required) => {
    const { actionUsable } = this.props
    const { isSubmitting } = this.props.triggerStore
    const hasError = actionUsable && required && isSubmitting && validateRequired(value)

    return {
      validateStatus: hasError ? 'error' : 'success',
      help: hasError ? '该字段不能为空' : ''
    }
  }

  renderContent() {
    const {
      field: { key, type, options },
      value,
      actionUsable,
      onChange,
      triggerIndexStore,
      triggerStore
    } = this.props

    const { fieldParams: { fullParams } } = triggerStore

    switch (type) {
      case 'select':
        return (
          <Select value={value} onChange={value => onChange(value, key)}>
            {
              options.map(item => <Option key={item.value}>{item.name}</Option>)
            }
          </Select>
        )
      case 'userSelect':
        return (
          <User
            store={triggerIndexStore}
            item={{ value }}
            setTriggerData={(triggerIndex, paramIndex, value, flag) => {
              // 选用户组时不走change
              if(flag !== 'staff') {
                onChange(value, key)
              }
            }}
          />
        )
      case 'text':
        return (
          <AddVar
            type="input"
            item={{ value }}
            titleParams={toJS(fullParams)}
            setTriggerData={(triggerIndex, paramIndex, value) => onChange(value, key)}
          />
        )
      case 'textarea':
        return (
          <AddVar
            type="textarea"
            item={{ value }}
            titleParams={toJS(fullParams)}
            setTriggerData={(triggerIndex, paramIndex, value) => onChange(value, key)}
          />
        )
      case 'mapList':
        return (
          <Headers
            value={value || []}
            onChange={value => onChange(value, key)}
          />
        )
      case 'tabs':
        return (
          <Body
            formData={value.formData || {}}
            raw={value.raw || {}}
            onChange={value => {
              onChange(value.formData, 'formData')
              // 防止两次同步onChange导致的数据更新不及时
              setTimeout(() => {
                onChange(value.raw, 'raw')
              })
            }}
          />
        )
      case 'keyValue':
        return (
          <ConfigTicket
            actionUsable={actionUsable}
            value={value}
            onChange={value => onChange(value, key)}
          />
        )
      case 'createTicket':
        return (
          <CreateTicket
            value={value}
            onChange={value => onChange(value, key)}
          />
        )
      default:
        return null
    }
  }

  render() {
    const { field, value } = this.props
    const { text, required } = field

    if (field.key === 'configTicket' || field.type === 'createTicket') {
      return this.renderContent()
    }

    return (
      <FormItem
        {...formItemLayout}
        className="trigger-actionTypes-item-wrap"
        label={text}
        required={!!required}
        {...this.getFormItemValidateInfo(value, required)}
      >
        {this.renderContent()}
      </FormItem>
    )
  }
}

export default Field
