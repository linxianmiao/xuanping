/**
 * 选择 开始/结束的触发事件
 */
import React, { Component } from 'react'
import { TreeSelect, Select } from '@uyun/components'
import { toJS } from 'mobx'

const { Option } = Select
class TriggerEventSelect extends Component {
  render() {
    const { type, data, timeFields, value } = this.props
    const selDom =
      type === 0
        ? data &&
          data.length > 0 && (
            <Select mode="multiple" onChange={val => this.props.onChange(val)} value={value}>
              {data.map(d => (
                <Option key={d.code}>{d.name}</Option>
              ))}
            </Select>
          )
        : timeFields &&
          timeFields.length > 0 && (
            <Select
              onSelect={val => this.props.onChange([val])}
              value={value ? value[0] : undefined}
            >
              {timeFields.map(d => (
                <Option key={d.code}>{d.name}</Option>
              ))}
            </Select>
          )
    return selDom
  }
}

export default TriggerEventSelect
