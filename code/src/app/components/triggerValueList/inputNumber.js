import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { InputNumber } from '@uyun/components'

export default class Float extends Component {
  static propTypes = {
    value: PropTypes.number,
    handleChange: PropTypes.func
  }

  render () {
    const { value, disabled, handleChange } = this.props
    return (
      <InputNumber
        disabled={disabled}
        value={value}
        onChange={handleChange}
      />
    )
  }
}
