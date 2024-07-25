import React, { Component } from 'react'
import classnames from 'classnames'
import { Input, Select } from '@uyun/components'
import _ from 'lodash'
const Option = Select.Option

function msToTime(ms) {
  const date = Math.floor(ms / (24 * 60 * 60 * 1000)) || '0'
  const hour = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)) || '00'
  const minute = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000)) || '00'
  const second = Math.floor((ms % (1000 * 60)) / 1000) || '00'
  return { date, hour, minute, second }
}

function timeToMs(time) {
  const { date, hour, minute, second } = time
  const ms =
    ((parseInt(date) * 24 + parseInt(hour)) * 60 + parseInt(minute)) * 60 * 1000 + second * 1000
  return `${ms}`
}

class TimeInterval extends Component {
  state = {
    values: msToTime(this.props.value) || { date: '0', hour: '00', minute: '00', second: '00' }
  }

  handleChangeHours = (value) => {
    const values = _.assign({}, this.state.values, { hour: value })
    this.setState(
      {
        values
      },
      () => {
        const ms = timeToMs(values)
        this.props.handleChange(ms)
      }
    )
  }

  handleChangeMinute = (value) => {
    const values = _.assign({}, this.state.values, { minute: value })
    this.setState(
      {
        values
      },
      () => {
        const ms = timeToMs(values)
        this.props.handleChange(ms)
      }
    )
  }

  handleChangeSecond = (value) => {
    const values = _.assign({}, this.state.values, { second: value })
    this.setState(
      {
        values
      },
      () => {
        const ms = timeToMs(values)
        this.props.handleChange(ms)
      }
    )
  }

  handleDayChange = (e) => {
    const reg = /^[0-9]*$/
    if (reg.test(e.target.value)) {
      const values = _.assign({}, this.state.values, { date: e.target.value })
      this.setState(
        {
          values
        },
        () => {
          const ms = timeToMs(values)
          this.props.handleChange(ms)
        }
      )
    }
  }

  render() {
    const { disabled, handleChange, selectedField, logics, comparison } = this.props
    const { timeGranularity } = selectedField || {}
    const { values } = this.state
    const { date, hour, minute, second } = values
    let show = true
    let showSecond = false
    if (timeGranularity && timeGranularity !== 3 && timeGranularity !== 4) {
      show = false
    }
    if (timeGranularity === 4) {
      showSecond = true
    }
    if (!_.isEmpty(logics)) {
      const timeGranularity = logics?.timeGranularity
      if (timeGranularity && timeGranularity !== 3 && timeGranularity !== 4) {
        show = false
      }
      if (timeGranularity === 4) {
        showSecond = true
      }
    }
    return (
      <div>
        <Input
          disabled={disabled}
          placeholder={i18n('day', '天')}
          style={{ width: 56 }}
          value={date}
          onChange={this.handleDayChange}
        />
        <span style={{ padding: '0 5px' }}>{i18n('day', '天')}</span>
        {show && (
          <>
            <Select
              value={hour}
              disabled={disabled}
              placeholder={i18n('hours', '小时')}
              onChange={this.handleChangeHours}
              style={{ width: 60, display: 'inline-block' }}
            >
              {Array.from({ length: 24 }, (item, idx) => (idx < 10 ? `0${idx}` : `${idx}`)).map(
                (item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                )
              )}
            </Select>
            <span style={{ padding: '0 5px' }}>{i18n('hours', '小时')}</span>
            <Select
              value={minute}
              disabled={disabled}
              onChange={this.handleChangeMinute}
              placeholder={i18n('minute', '分钟')}
              style={{ width: 60, display: 'inline-block' }}
            >
              {Array.from({ length: 60 }, (item, idx) => (idx < 10 ? `0${idx}` : `${idx}`)).map(
                (item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                )
              )}
            </Select>
            <span style={{ padding: '0 5px' }}>{i18n('minute', '分钟')}</span>
          </>
        )}
        {showSecond && (
          <>
            <Select
              value={second}
              disabled={disabled}
              onChange={this.handleChangeSecond}
              placeholder={i18n('globe.seconds', '秒')}
              style={{ width: 60, display: 'inline-block' }}
            >
              {Array.from({ length: 60 }, (item, idx) => (idx < 10 ? `0${idx}` : `${idx}`)).map(
                (item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                )
              )}
            </Select>
            <span style={{ padding: '0 5px' }}>{i18n('globe.seconds', '秒')}</span>
          </>
        )}
      </div>
    )
  }
}
export default TimeInterval
