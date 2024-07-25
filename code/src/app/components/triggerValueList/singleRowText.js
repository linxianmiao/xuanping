import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Input } from '@uyun/components'

class SingleRowText extends Component {
  static propTypes = {
    value: PropTypes.string,
    handleChange: PropTypes.func
  }

  render () {
    const { value, disabled, handleChange } = this.props
    return (
      <Input
        disabled={disabled}
        value={value}
        onChange={e => { handleChange(e.target.value) }}
        placeholder={i18n('ticket.forms.pinput', '请输入')}
      />
    )
  }
}

export default SingleRowText
