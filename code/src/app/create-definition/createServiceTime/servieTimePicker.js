import React, { Component } from 'react'
import { TimePicker, Divider, Radio, Input, Popover } from '@uyun/components'
import moment from 'moment'
const format = 'HH:mm'
class CreateServiceTime extends Component {
  state = {
    radioValue: undefined
  }

  handleChangeRadio = (radioValue) => {
    const { work, timeType, index } = this.props
    if (radioValue === 'a') {
      this.props.handleChange &&
        this.props.handleChange(
          _.assign({}, work, {
            [`start${timeType}`]: timeType === 'AM' ? '09:00' : '14:00',
            [`end${timeType}`]: timeType === 'AM' ? '12:00' : '18:00'
          }),
          index
        )
    } else if (radioValue === 'b') {
      this.props.handleChange &&
        this.props.handleChange(
          _.assign({}, work, {
            [`start${timeType}`]: timeType === 'AM' ? '08:30' : '13:30',
            [`end${timeType}`]: timeType === 'AM' ? '11:30' : '17:30'
          }),
          index
        )
    }
    this.setState({ radioValue })
  }

  handleChangeTime = (time, timeString, type) => {
    const { work, timeType, index } = this.props
    this.props.handleChange &&
      this.props.handleChange(
        _.assign({}, work, {
          [`${type}${timeType}`]: timeString
        }),
        index
      )
  }

  range(start, end) {
    const result = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }

  renderContent = () => {
    const { startTime, endTime, timeType } = this.props
    const { radioValue } = this.state
    const disabledHoursAM = Array.from({ length: 13 }, (item, index) => index + 14)
    let disabledHoursPM = Array.from({ length: 13 }, (item, index) => index)
    disabledHoursPM = _.filter(disabledHoursPM, (v) => v !== 0)
    return (
      <div>
        <Radio.Group
          onChange={(e) => {
            this.handleChangeRadio(e.target.value)
          }}
          value={radioValue}
          buttonStyle="solid"
        >
          <Radio.Button value="a">{timeType === 'AM' ? '09:00~12:00' : '14:00~18:00'}</Radio.Button>
          <Radio.Button value="b">
            {timeType === 'AM' ? '08:30~11:30' : '13:30~17:30'}{' '}
          </Radio.Button>
          <Radio.Button value="c">
            {i18n('create-definiton-server-time-week-customize', '自定义')}
          </Radio.Button>
        </Radio.Group>
        {radioValue === 'c' && (
          <React.Fragment>
            <Divider />
            <div className="flex-space-between">
              <TimePicker
                allowEmpty
                hideDisabledOptions
                disabledHours={() => (timeType === 'AM' ? disabledHoursAM : disabledHoursPM)}
                disabledMinutes={(time) =>
                  timeType === 'AM'
                    ? +time === 13 && this.range(1, 60)
                    : +time === 0 && this.range(1, 60)
                }
                format={format}
                style={{ width: 100 }}
                value={startTime ? moment(startTime, format) : undefined}
                onChange={(time, timeString) => {
                  if (timeType === 'PM' && timeString === '00:00') {
                    this.handleChangeTime(time, '24:00', 'start')
                    return
                  }
                  this.handleChangeTime(time, timeString, 'start')
                }}
              />
              <TimePicker
                allowEmpty
                hideDisabledOptions
                format={format}
                style={{ width: 100 }}
                disabledHours={() => (timeType === 'AM' ? disabledHoursAM : disabledHoursPM)}
                disabledMinutes={(time) =>
                  timeType === 'AM'
                    ? +time === 13 && this.range(1, 60)
                    : +time === 0 && this.range(1, 60)
                }
                value={endTime ? moment(endTime, format) : undefined}
                onChange={(time, timeString) => {
                  if (timeType === 'PM' && timeString === '00:00') {
                    this.handleChangeTime(time, '24:00', 'end')
                    return
                  }
                  this.handleChangeTime(time, timeString, 'end')
                }}
              />
            </div>
          </React.Fragment>
        )}
      </div>
    )
  }

  render() {
    const { startTime, endTime, timeType } = this.props
    const value = endTime && startTime ? `${startTime}~${endTime}` : undefined
    return (
      <Popover trigger="click" placement="bottom" content={this.renderContent()}>
        <div>
          {timeType}
          <Input value={value} style={{ width: 150, marginLeft: 15 }} />
        </div>
      </Popover>
    )
  }
}
export default CreateServiceTime
