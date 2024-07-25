import React, { Component } from 'react'
import classnames from 'classnames'
import { Tag, Input } from '@uyun/components'
import TagsInput from '~/components/tagsInput'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import { matchReg } from '../utils/stringify'
import { isJSON } from '~/utils/common'

class Tags extends Component {
  handleValidate = (rule, value, callback) => {
    const { field } = this.props

    try {
      value = value ? (Array.isArray(value) ? value : JSON.parse(value)) : []
      if (rule.required && value.length === 0) {
        callback(`${i18n('ticket.forms.pinput', '请输入')}${field.name}`)
      } else {
        let msg
        value.forEach((item) => {
          const { match, message } = matchReg(item, field.validation, field.reg)

          if (!match) {
            msg = message
          }
        })

        callback(msg)
      }
    } catch (e) {
      callback(i18n('tag_data_format_error', '数组类型字段的数据格式不正确'))
    }
  }

  _render = () => {
    const { getFieldValue, field } = this.props
    const initialValue = getFieldValue(field.code)
    if (!initialValue) {
      return '--'
    } else if (Array.isArray(initialValue)) {
      return initialValue.map((item) => <Tag key={item}>{item}</Tag>)
    } else if (isJSON(initialValue)) {
      return JSON.parse(initialValue).map((item) => <Tag key={item}>{item}</Tag>)
    } else {
      return initialValue
    }
  }

  renderReadOnly() {
    const { secrecy, type, disabled, field } = this.props

    if (secrecy) {
      return <Secrecy />
    }
    if (type !== 'config' && disabled) {
      return <div className="pre-wrap disabled-ticket-form">{this._render()}</div>
    }
    return null
  }

  render() {
    const { field, getFieldDecorator, disabled, type, fieldMinCol, formLayoutType } = this.props
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: field.defaultValue || undefined,
          rules: [
            {
              required: +field.isRequired === 1,
              validator: this.handleValidate
            }
          ]
        })(
          <TagsInput
            disabled={field.isRequired === 2}
            id={field.code}
            className={classnames({
              'disabled-item': disabled
            })}
            isRequired={field.isRequired}
          />
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}

export default Tags
