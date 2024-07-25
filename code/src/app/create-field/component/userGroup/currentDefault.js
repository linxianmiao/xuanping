import React from 'react'
import { Radio, Checkbox } from '@uyun/components'
import UserPicker from '~/components/userPicker'

const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

export default class CurrentDefault extends React.Component {
  update = (data) => {
    this.props.onChange({ ...this.props.value, ...data })
  }

  handleRadioChange = (e) => {
    if (e.target.value === 1) {
      // 当前用户组
      this.update({ curUserGroup: true, defaultValue: null })
    } else {
      // 指定用户组
      this.update({ curUserGroup: false, defaultValue: [] })
    }
  }

  handleCheckboxChange = (values) => {
    this.update({
      curUserGroup: values.includes(1),
      defaultValue: values.includes(2) ? this.props.value.defaultValue || [] : null
    })
  }

  handleUserPickerChange = (values) => {
    this.update({ defaultValue: values })
  }

  renderOptions(Com) {
    let options = [
      { value: 1, label: i18n('default-current_user_group', '当前用户组') },
      { value: 2, label: i18n('default_specific_user_group', '指定用户组') }
    ]
    if (this.props?.source === 'dataBase') {
      options = [{ value: 2, label: i18n('default_specific_user_group', '指定用户组') }]
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
      value: { curUserGroup, defaultValue }
    } = this.props
    let content
    if (isSingle) {
      const radioValue = curUserGroup ? 1 : 2
      content = (
        <RadioGroup onChange={this.handleRadioChange} value={radioValue}>
          {this.renderOptions(Radio)}
        </RadioGroup>
      )
    } else {
      const checkboxValue = []
      if (curUserGroup) checkboxValue.push(1)
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
            tabs={[0]}
            showTypes={['groups']}
            value={defaultValue}
            onChange={this.handleUserPickerChange}
            selectionType={isSingle ? 'radio' : 'checkbox'}
            isString
            modalTitle={'用户组选择'}
          />
        ) : null}
      </div>
    )
  }
}
