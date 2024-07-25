import React, { Component } from 'react'
import classnames from 'classnames'
import { Input, Select } from '@uyun/components'
const Option = Select.Option

class Inner extends Component {
  state = {
    values: this.props.init
  }

  componentWillReceiveProps = (nextProps, nextState) => {
    const { value } = nextProps
    const { values } = nextState
    if (!_.isEqual(value, values)) {
      this.setState({ values: value })
    }
  }

  handleChangeHours = (value) => {
    const values = _.assign({}, this.state.values, { hour: value })
    this.setState(
      {
        values
      },
      () => {
        this.props.onChange(values)
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
        this.props.onChange(values)
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
          this.props.onChange(values)
        }
      )
    }
  }

  render() {
    const { field, disabled, popupContainerId } = this.props
    const { timeRule } = field
    const { date, hour, minute } = this.state.values
    const ref = document.getElementById(`${popupContainerId}`)
    return (
      <div
        className={classnames({
          'disabled-item': disabled
        })}
        id={field.code}
      >
        {timeRule === '1' && (
          <Input
            disabled={disabled}
            placeholder={field.isRequired ? '' : i18n('day', '天')}
            style={{ width: 56 }}
            value={date}
            onChange={this.handleDayChange}
          />
        )}
        {timeRule === '1' && <span style={{ padding: '0 5px' }}>{i18n('day', '天')}</span>}
        {disabled ? (
          <Input disabled={disabled} value={hour} style={{ width: 56 }} />
        ) : (
          <Select
            value={hour}
            disabled={disabled}
            placeholder={field.isRequired ? '' : i18n('hours', '小时')}
            onChange={this.handleChangeHours}
            style={{ width: 60, display: 'inline-block' }}
            getPopupContainer={() => ref || document.body}
          >
            {Array.from({ length: 24 }, (item, idx) => (idx < 10 ? `0${idx}` : `${idx}`)).map(
              (item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              )
            )}
          </Select>
        )}

        <span style={{ padding: '0 5px' }}>{i18n('hours', '小时')}</span>
        {disabled ? (
          <Input disabled={disabled} value={hour} style={{ width: 56 }} />
        ) : (
          <Select
            value={minute}
            disabled={disabled}
            onChange={this.handleChangeMinute}
            placeholder={field.isRequired ? '' : i18n('minute', '分钟')}
            style={{ width: 60, display: 'inline-block' }}
            getPopupContainer={() => ref || document.body}
          >
            {Array.from({ length: 60 }, (item, idx) => (idx < 10 ? `0${idx}` : `${idx}`)).map(
              (item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              )
            )}
          </Select>
        )}

        <span style={{ padding: '0 5px' }}>{i18n('minute', '分钟')}</span>
      </div>
    )
  }
}
export default Inner
