import React, { Component } from 'react'
import { Select } from '@uyun/components'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
// import { FormDebounceSelect } from '../../../components/FormController'

const { Option, OptGroup } = Select

class AutoMation extends Component {
  _render() {
    const { field, getFieldValue } = this.props
    const initialValue = getFieldValue(field.code)
    let defaultLabel = ''
    if (initialValue && field.resParams) {
      _.forEach(field.resParams, (val) => {
        const obj = _.find(val, (item) => item.value === initialValue)
        if (obj) {
          defaultLabel = obj.label
          return false
        }
      })
    }
    return defaultLabel
  }

  renderReadOnly() {
    const { secrecy, type, disabled } = this.props

    if (secrecy) {
      return <Secrecy />
    }
    if (type !== 'config' && disabled) {
      return <div className="pre-wrap disabled-ticket-form">{this._render()}</div>
    }
    return null
  }

  render() {
    const {
      field,
      getFieldDecorator,
      disabled,
      type,
      fieldMinCol,
      popupContainerId,
      formLayoutType
    } = this.props
    let init = null
    const params = field.resParams
    const defaultOptions = []
    for (const key in params) {
      for (const item of params[key]) {
        if (item.select) {
          defaultOptions.push(item.value)
        }
      }
    }

    init =
      field.defaultValue && field.defaultValue.length > 0
        ? `${field.defaultValue}`
        : defaultOptions.length > 0
        ? `${defaultOptions[0]}`
        : null
    const ref = document.getElementById(`${popupContainerId}`)
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: init,
          rules: [
            {
              required: +field.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${field.name}`
            }
          ]
        })(
          // <FormDebounceSelect code={field.code}>
          <Select
            className={classnames({
              'disabled-item': disabled
            })}
            id={field.code}
            allowClear
            showSearch
            disabled={disabled}
            placeholder={`${i18n('globe.select', '请选择')}${field.name}`}
            notFoundContent={`${i18n('globe.notFound', '无法找到')}`}
            optionFilterProp="children"
            getPopupContainer={() => ref || document.body}
          >
            {(() => {
              const GroupList = []
              for (const key in field.resParams) {
                GroupList.push(
                  <OptGroup key={key} label={key}>
                    {field.resParams[key].map((data) => {
                      return (
                        <Option key={`${data.value}`} value={`${data.value}`}>
                          {data.label}
                        </Option>
                      )
                    })}
                  </OptGroup>
                )
              }
              return GroupList
            })()}
          </Select>

          // </FormDebounceSelect>
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}

export default AutoMation
