import React from 'react'
import { Input } from '@uyun/components'

class TextAreaEditor extends React.Component {
  render() {
    const { value, onChange, disabled } = this.props
    return (
      <Input.TextArea
        value={value}
        autosize={{ minRows: 2, maxRows: 600 }}
        id="textAreaWithFile"
        onChange={onChange}
        disabled={disabled}
        placeholder="请输入工单备注"
      />
    )
  }
}

export default TextAreaEditor
