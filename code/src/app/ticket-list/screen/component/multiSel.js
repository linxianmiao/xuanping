import React, { Component } from 'react'
import { Select } from '@uyun/components'
const Option = Select.Option

class MultiSel extends Component {
    handleChange = e => {
      this.props.handleScreenData({ [this.props.item.value]: e })
    }

    render () {
      const { item } = this.props
      return (
        <div className="screen-item-wrap">
          <div className="screen-item-inner">
            <span className="screen-item-label">{item.label}</span>
            <Select
              allowClear
              mode="multiple"
              onChange={e => { this.handleChange(e) }}
              placeholder={`${i18n('ticket.list.screen.select', '请选择')}${item.label}`}
              notFoundContent={i18n('ticket.list.screen.notFind', '无法找到')}
            >
              {
                item.params.map(data => {
                  return <Option key={data.value} value={data.value}>{data.label}</Option>
                })
              }
            </Select>
          </div>
        </div>
      )
    }
}

export default MultiSel
