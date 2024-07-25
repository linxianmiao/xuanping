import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Input } from '@uyun/components'

export default class MultiRowText extends Component {
  static propTypes = {
    value: PropTypes.string,
    handleChange: PropTypes.func
  }

  render () {
    const { value, disabled, handleChange } = this.props
    return (
      <Input.TextArea
        disabled={disabled}
        value={value}
        onChange={e => { handleChange(e.target.value) }}
        placeholder={i18n('ticket.forms.pinput', '请输入')}
      />
    )
  }
}
