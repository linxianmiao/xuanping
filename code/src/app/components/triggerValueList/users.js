import React, { Component } from 'react'
import PropTypes from 'prop-types'
import UserPicker from '~/components/userPicker'

class ItsmTreeSel extends Component {
  static propTypes = {
    value: PropTypes.array,
    type: PropTypes.string,
    handleChange: PropTypes.func
  }

  getTab = (type) => {
    switch (type) {
      case 'user':
        return [1]
      case 'group':
        return [0]
      case 'role':
        return [3]
      case 'department':
        return [2]
    }
  }

  getShowtype = (type) => {
    switch (type) {
      case 'user':
        return ['users']
      case 'group':
        return ['groups']
      case 'role':
        return ['roles_custom']
      case 'department':
        return ['departs_custom']
    }
  }

  render() {
    const { value, handleChange, type, disabled } = this.props
    return (
      <UserPicker
        disabled={disabled}
        isString
        value={value}
        tabs={this.getTab(type)}
        showTypes={this.getShowtype(type)}
        onChange={handleChange}
      />
    )
  }
}
export default ItsmTreeSel
