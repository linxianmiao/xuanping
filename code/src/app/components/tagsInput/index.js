import React, { Component } from 'react'
import { Select } from '@uyun/components'
import { parseTagsDataToArray } from '~/utils/common'

/**
 * 多个标签输入框
 */
class TagsInput extends Component {
  static defaultProps = {
    size: 'default'
  }

  state = {
    keyword: ''
  }

  handleEnterPress = (e) => {
    const { keyword } = this.state

    if (e.key === 'Enter' && keyword) {
      const { value, onChange } = this.props
      const newValue = this.parseValue(value)

      if (!newValue.includes(keyword)) {
        newValue.push(keyword)
      }

      // 清空输入框
      this.select.rcSelect.setInputValue('')
      this.setState({ keyword: '' })
      onChange(newValue)
    }
  }

  handleChange = (value) => {
    this.props.onChange(value)
  }

  handleFocus = () => {
    window.addEventListener('keyup', this.handleEnterPress)
  }

  handleBlur = () => {
    window.removeEventListener('keyup', this.handleEnterPress)
  }

  parseValue = (value) => {
    return parseTagsDataToArray(value)
  }

  render() {
    const { value, disabled, size, className, id, isRequired } = this.props
    return (
      <Select
        ref={(e) => {
          this.select = e
        }}
        id={id}
        className={className}
        disabled={disabled}
        placeholder={isRequired === 2 ? '' : i18n('ticket.forms.pinput', '请输入')}
        size={size}
        mode="tags"
        open={false}
        value={this.parseValue(value)}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onSearch={(v) => this.setState({ keyword: v })}
        onChange={this.handleChange}
      />
    )
  }
}

export default TagsInput
