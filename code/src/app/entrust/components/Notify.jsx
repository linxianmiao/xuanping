import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Checkbox } from '@uyun/components'
const CheckboxGroup = Checkbox.Group
@inject('entrustStore')
@observer
export default class Notify extends Component {
  onChange = (checkedList) => {
    const { actionList } = this.props.entrustStore
    this.props.onChange(
      _.filter(actionList, item => _.includes(checkedList, item.actionCode))
    )
  }

  getValue = (value) => {
    return _.map(value, item => item.actionCode)
  }

  render() {
    const { actionList } = this.props.entrustStore
    const { value } = this.props
    const options = _.map(actionList, item => ({
      label: item.name,
      value: item.actionCode,
      disabled: item.type === 'sendSys'
    }))

    return (
      <CheckboxGroup
        options={options}
        value={this.getValue(value)}
        onChange={this.onChange}
      />
    )
  }
}