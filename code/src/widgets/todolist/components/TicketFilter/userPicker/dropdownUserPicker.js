import React, { Component } from 'react'
import { Select } from '@uyun/components'
import ITSMUserPickerTable from './itsmUserPickerTable'

export default class DropdownUserPicker extends Component {
  render() {
    return (
      <Select
        dropdownRender={() => <ITSMUserPickerTable />}
      />
    )
  }
}