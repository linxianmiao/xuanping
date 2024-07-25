import React, { Component } from 'react'
import moment from 'moment'
import { Input, Select } from '@uyun/components'
const Option = Select.Option
class TimeInterval extends Component {
  constructor (props) {
    super(props)
    this.state = {
      values: props.value || {}
    }
  }

    handleChangeHours = value => {
      const values = _.assign({}, this.state.values, { hour: value })
      this.setState({
        values
      }, () => {
        this.props.onChangeCondition(values)
      })
    }

    handleChangeMinute = value => {
      const values = _.assign({}, this.state.values, { minute: value })
      this.setState({
        values
      }, () => {
        this.props.onChangeCondition(values)
      })
    }

    handleDayChange = e => {
      const reg = /^[0-9]*$/
      if (reg.test(e.target.value)) {
        const values = _.assign({}, this.state.values, { date: e.target.value })
        this.setState({
          values
        }, () => {
          this.props.onChangeCondition(values)
        })
      }
    }

    render () {
      const { date, hour, minute } = this.state.values
      const { item, id } = this.props
      return (
        <div>
          { item.timeRule === '1' && <Input
            placeholder={i18n('day', '天')} style={{ width: 56 }} value={date}
            onChange={this.handleDayChange} />}
          {item.timeRule === '1' && <span style={{ padding: '0 5px' }}>{i18n('day', '天')}</span>}
          <Select
            value={hour}
            placeholder={i18n('hours', '小时')}
            onChange={this.handleChangeHours}
            style={{ width: 56, display: 'inline-block' }}
            getPopupContainer={() => document.getElementById(id || 'fields-wrap')}>
            {Array.from({ length: 24 }, (item, idx) => idx < 10 ? `0${idx}` : `${idx}`).map(item => <Option key={item} value={item}>{item}</Option>)}
          </Select>
          <span style={{ padding: '0 5px' }}>{i18n('hours', '小时')}</span>
          <Select
            value={minute}
            onChange={this.handleChangeMinute}
            placeholder={i18n('minute', '分钟')}
            style={{ width: 56, display: 'inline-block' }}
            getPopupContainer={() => document.getElementById(id || 'fields-wrap')}>
            {Array.from({ length: 60 }, (item, idx) => idx < 10 ? `0${idx}` : `${idx}`).map(item => <Option key={item} value={item}>{item}</Option>)}
          </Select>
          <span style={{ padding: '0 5px' }}>{i18n('minute', '分钟')}</span>
          {/* <TimePicker
                    size='large'
                    onChange={this.handleTimeChange}
                    getPopupContainer={() => document.getElementById(id || 'fields-wrap')}
                    value={(hour && minute) ? moment(`${hour}:${minute}`, format) : undefined}
                    format={format} /> */}
        </div>
      )
    }
}
export default TimeInterval
