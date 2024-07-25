import React, { Component } from 'react'
import { toJS } from 'mobx'
import classnames from 'classnames'
import { RadioGroup, RadioButtonGroup, Text } from '~/components/SelectWithColor'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'

class SingleSel extends Component {
  _render = () => {
    const { getFieldValue, field } = this.props
    const initialValue = getFieldValue(field.code)
    const param = _.find(field.params, (param) => `${param.value}` === `${initialValue}`)
    if (param) {
      return (
        <Text isChooseColor={field.isChooseColor} color={param.color}>
          {param.label}
        </Text>
      )
    } else {
      return '--'
    }
  }

  renderRadios = () => {
    const { field, disabled, secrecy } = this.props
    const radiosProps = {
      disabled: field.isRequired === 2,
      id: field.code,
      className: classnames({ 'disabled-item': disabled }),
      isChooseColor: field.isChooseColor,
      options: toJS(field.params)
    }

    return field.isSingle === '1' ? (
      <RadioButtonGroup {...radiosProps} /> // 选项卡模式
    ) : (
      <RadioGroup {...radiosProps} />
    ) // 常规radio模式
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
    let {
      field,
      getFieldDecorator,
      disabled,
      forms,
      type,
      initialValue,
      fieldMinCol,
      formLayoutType
    } = this.props
    if (type === 'preview') {
      const fieldDefaultParam = _.find(field.params, (d) => d.select === 1)
      initialValue = fieldDefaultParam && fieldDefaultParam.value
    }
    if (typeof initialValue === 'number' && field.code != 'urgentLevel') {
      initialValue = `${initialValue}`
    }
    if (field.code === 'urgentLevel') {
      if (typeof initialValue === 'number') {
        initialValue = `${initialValue}`
      } else if (forms && typeof forms.priority === 'number') {
        initialValue = `${forms.priority}`
      }
    }
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValue || undefined,
          rules: [
            {
              required: +field.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${field.name}`
            }
          ]
        })(this.renderRadios())}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}

export default SingleSel
