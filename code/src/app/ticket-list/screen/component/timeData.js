import React, { Component } from 'react'
import { DatePicker } from '@uyun/components'
const RangePicker = DatePicker.RangePicker

class TimeData extends Component {
    handleChange = (dates, dateStrings) => {

    }

    render () {
      const { item } = this.props
      return (
        <div className="screen-item-wrap">
          <div className="screen-item-inner">
            <span className="screen-item-label">{item.label}</span>
            <RangePicker
              format="YYYY-MM-DD"
              onChange={(dates, dateStrings) => { this.handleChange(dates, dateStrings) }}
            />
          </div>
        </div>
      )
    }
}

export default TimeData
