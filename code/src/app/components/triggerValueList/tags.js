import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TagsInput from '~/components/tagsInput'

class Tags extends Component {
  static propTypes = {
    value: PropTypes.string,
    handleChange: PropTypes.func
  }

  render() {
    const { value, disabled, handleChange } = this.props
    return <TagsInput value={value} disabled={disabled} onChange={value => handleChange(value)} />
  }
}

export default Tags