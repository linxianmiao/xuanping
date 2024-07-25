import React, { Component } from 'react'
import Item from './item'
import { InfoCircleOutlined, PlusOutlined } from '@uyun/icons'
import { Button, Tooltip } from '@uyun/components'
export default class Inner extends Component {
  addItem = () => {
    const { value = [] } = this.props
    const data = {
      type: '', // 属性类型
      code: '', // 属性code
      name: '', // 属性名称
      value: null // 属性value
    }
    this.props.onChange([...value, data])
  }

  handleChange = (data, idx) => {
    const { value } = this.props
    this.props.onChange(
      _.map(value, (item, index) => {
        if (idx === index) {
          return data
        }
        return item
      })
    )
  }

  handleDel = (idx) => {
    const { value } = this.props
    this.props.onChange(_.filter(value, (item, index) => index !== idx))
  }

  render() {
    const { expandField, value = [], disabled } = this.props
    return (
      <div className="resource-attributeColumns">
        {_.map(value, (item, index) => {
          const dilver = {
            item,
            index,
            expandField,
            handleChange: this.handleChange,
            handleDel: this.handleDel
          }
          return <Item key={index} {...dilver} />
        })}
        <Button icon={<PlusOutlined />} disabled={disabled} onClick={this.addItem}>
          {i18n('field_value_filterValue', '过滤条件')}
        </Button>
        <Tooltip title={i18n('field_value_filterValueTips', '属性筛选仅支持字典类型的字段')}>
          <InfoCircleOutlined style={{ marginLeft: '15px' }} />
        </Tooltip>
      </div>
    )
  }
}
