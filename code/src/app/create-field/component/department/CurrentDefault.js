import React from 'react'
import { Radio, Checkbox } from '@uyun/components'
import UserPicker from '~/components/userPicker'

const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

// curr_depart

export default class CurrentDefault extends React.Component {
  update = (data) => {
    this.props.onChange({ ...this.props.value, ...data })
  }

  handleRadioChange = (e) => {
    if (e.target.value === 1) {
      // 当前用户
      this.update({ curr_depart: true, defaultValue: null })
    } else {
      // 指定用户
      this.update({ curr_depart: false, defaultValue: [] })
    }
  }

  handleCheckboxChange = (values) => {
    this.update({
      curr_depart: values.includes(1),
      defaultValue: values.includes(2) ? this.props.value.defaultValue || [] : null
    })
  }

  handleUserPickerChange = (values) => {
    this.update({ defaultValue: values })
  }

  renderOptions(Com) {
    let options = [
      { value: 1, label: i18n('default_current_depart', '当前部门') },
      { value: 2, label: i18n('default_specific_depart', '指定部门') }
    ]
    if (this.props?.source === 'dataBase') {
      options = [{ value: 2, label: i18n('default_specific_depart', '指定部门') }]
    }
    return options.map(({ value, label }) => (
      <div key={value} style={{ lineHeight: '40px' }}>
        <Com value={value}>{label}</Com>
      </div>
    ))
  }

  render() {
    const {
      isSingle,
      value: { curr_depart, defaultValue }
    } = this.props
    let content
    if (isSingle) {
      const radioValue = curr_depart ? 1 : 2
      content = (
        <RadioGroup onChange={this.handleRadioChange} value={radioValue}>
          {this.renderOptions(Radio)}
        </RadioGroup>
      )
    } else {
      const checkboxValue = []
      if (curr_depart) checkboxValue.push(1)
      if (defaultValue) checkboxValue.push(2)
      content = (
        <CheckboxGroup onChange={this.handleCheckboxChange} value={checkboxValue}>
          {this.renderOptions(Checkbox)}
        </CheckboxGroup>
      )
    }
    return (
      <div>
        {content}
        {defaultValue ? (
          <UserPicker
            tabs={[2]}
            showTypes={['departs_custom']}
            value={defaultValue}
            onChange={this.handleUserPickerChange}
            selectionType={isSingle ? 'radio' : 'checkbox'}
            modalTitle={'部门选择'}
            isString
          />
        ) : null}
      </div>
    )
  }
}
