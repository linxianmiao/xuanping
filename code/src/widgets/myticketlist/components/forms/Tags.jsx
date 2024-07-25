import React, { Component } from 'react'
import { Form, Select } from '@uyun/components'
import { parseTagsDataToArray } from '../../config'
import { inject } from '@uyun/core'
const FormItem = Form.Item

class TagsInput extends Component {
  @inject('i18n') i18n
  @inject('widget') widget

  static defaultProps = {
    size: 'default'
  }

  constructor(props, context) {
    super(props, context)
    if (this.widget) {
      this.windowWin = this.widget.getContextWindow()
    }
    this.state = {
      keyword: ''
    }
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
      this.select?.rcSelect?.setInputValue('')
      this.setState({ keyword: '' })
      onChange(newValue)
    }
  }

  handleChange = (value) => {
    this.props.onChange(value)
  }

  handleFocus = () => {
    const w = this.windowWin || window
    w.addEventListener('keyup', this.handleEnterPress)
  }

  handleBlur = () => {
    const w = this.windowWin || window
    w.removeEventListener('keyup', this.handleEnterPress)
  }

  parseValue = (value) => {
    return parseTagsDataToArray(value)
  }

  render() {
    const { value, disabled, className, name } = this.props
    return (
      <Select
        ref={(e) => {
          this.select = e
        }}
        className={className}
        disabled={disabled}
        placeholder={`请输入${name}`}
        mode="tags"
        size="small"
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

class Tags extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, disabled } = this.props
    return (
      <FormItem {...formItemLayout} label={''}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(<TagsInput disabled={disabled} name={item.name} />)}
      </FormItem>
    )
  }
}

export default Tags
