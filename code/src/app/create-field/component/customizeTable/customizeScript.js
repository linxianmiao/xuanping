import React, { Component } from 'react'
import { Card } from '@uyun/components'

/**
 * setFieldsValue  form的setFieldsValue     必传
 * title           卡片标题                  string|ReactNode
 * extra           卡片右上角的操作区域       string|ReactNode
 */

export default class CustomScript extends Component {
  static defaultProps = {
    setFieldsValue: () => {}
  }

  handleChange = (value) => {
    // this.props.onChange(value)
    this.props.setFieldsValue({ [this.props.id]: value })
  }

  render () {
    const { value, title, extra } = this.props
    return (
      <Card
        type="inner"
        className="customize-table"
        title={title}
        extra={extra}>
        <CodeEditor value={value} onChange={this.handleChange} />
      </Card>
    )
  }
}
