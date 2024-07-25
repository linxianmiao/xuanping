import React, { Component } from 'react'
import { Select, Input, Cascader } from '@uyun/components'
import { TextRecognitionHttp } from '../utils/scriptfunc'
const Option = Select.Option
export default class BodyCell extends Component {
  get cellProps() {
    const { cellProps = {}, columnKey, disabled } = this.props
    const cells = cellProps[columnKey] || {}
    // 单元格的禁用增加逻辑 ， 表单禁用 + 字段禁用 + 脚本单元格禁用
    const cellsDisabled = cells.disabled || disabled
    return _.assign({}, cells, { disabled: cellsDisabled })
  }

  handleChange = (value) => {
    const { rowKey, columnKey } = this.props
    this.props.handleChange(value, rowKey, columnKey)
  }

  renderSingRowText = (disabled) => {
    const { value, editing } = this.props
    if (disabled || !editing) return TextRecognitionHttp(value)
    return (
      <Input
        value={value}
        onChange={(e) => {
          this.handleChange(e.target.value)
        }}
        placeholder={i18n('ticket.forms.pinput', '请输入')}
      />
    )
  }

  renderSingSel = (disabled) => {
    const { options, value, editing } = this.props
    if (disabled || !editing) {
      const option = _.find(options, (item) => item.value === value)
      return option ? option.label : value
    }
    return (
      <Select
        showSearch
        value={value}
        style={{ width: '100%' }}
        placeholder={i18n('pls_select', '请选择')}
        notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
        onChange={this.handleChange}
      >
        {_.map(options, (item) => (
          <Option key={item.value} value={item.value}>
            {item.label}
          </Option>
        ))}
      </Select>
    )
  }

  renderCascader = (disabled) => {
    const { options, value, editing } = this.props
    if (disabled || !editing) {
      let formatValue = ''
      if (Array.isArray(value) && value.length > 0) {
        let optionx = {}
        _.forEach(value, (data, i) => {
          if (i < value.length) {
            if (_.isEmpty(optionx)) {
              optionx = _.find(options, (d) => d.value === data)
            } else {
              optionx = _.find(optionx?.children, (d) => d.value === data)
            }
            formatValue += `/${optionx?.label}`
          }
        })
      }
      return formatValue.substring(1, formatValue.length)
    }
    return <Cascader allowClear value={value} onChange={this.handleChange} options={options} />
  }

  _render() {
    const { type, value, editable } = this.props
    const { disabled, hidden } = this.cellProps
    if (hidden) {
      return null
    }
    if (!editable) {
      switch (type) {
        case 'singleRowText':
          return this.renderSingRowText(!editable)
        case 'singleSel':
          return this.renderSingSel(!editable)
        case 'cascader':
          return this.renderCascader(!editable)
        default:
          return typeof value === 'string' ? TextRecognitionHttp(value) : this.props.children
      }
    }
    switch (type) {
      case 'singleRowText':
        return this.renderSingRowText(disabled)
      case 'singleSel':
        return this.renderSingSel(disabled)
      case 'cascader':
        return this.renderCascader(disabled)
      default:
        return typeof value === 'string' ? TextRecognitionHttp(value) : this.props.children
    }
  }

  render() {
    const { colSpan = 1, rowSpan = 1 } = this.cellProps
    if (rowSpan === 0 || colSpan === 0) return null
    return (
      <td rowSpan={rowSpan} colSpan={colSpan} className={this.props.className}>
        {this._render()}
      </td>
    )
  }
}
