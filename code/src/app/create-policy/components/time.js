import React, { Component } from 'react'
import { Select, Input } from '@uyun/components'
import { timeList } from '../../create-definition/config'
const Option = Select.Option

class Time extends Component {
    handleChange = (value, key) => {
      const { item, index } = this.props
      this.props.handleChange(_.assign({}, item, { [key]: value }), index)
    }

    render () {
      const { item } = this.props
      const { timeDifferenceUnit, timeDifference } = item
      const selectAfter = (
        <Select
          onChange={(value) => {
            this.handleChange(value, 'timeDifferenceUnit')
          }}
          value={timeDifferenceUnit}
          style={{ width: 100 }}>
          {_.map(timeList, item => <Option value={item.value} key={item.value}>{item.label}</Option>)}
        </Select>
      )
      return (
        <Input
          onChange={(e) => {
            const value = e.target.value || undefined
            this.handleChange(value, 'timeDifference')
          }}
          value={timeDifference}
          addonAfter={selectAfter} />
      )
    }
}

export default Time
