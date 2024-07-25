import React, { Component } from 'react'
import moment from 'moment'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import DateTime from '~/components/TicketDate'

function DateTimeWrap(props) {
  if (props.disabled) {
    const { field } = props
    const timezoneOffset = moment().utcOffset()
    const format =
      field.timeGranularity === 2
        ? 'YYYY-MM-DD'
        : field.timeGranularity === 3
        ? 'YYYY-MM-DD HH:mm'
        : field.timeGranularity === 4
        ? 'YYYY-MM-DD HH:mm:ss'
        : 'YYYY-MM'

    return (
      <div className="disabled-ticket-form">
        {props.value ? moment(props.value).utc(timezoneOffset).format(format) : '--'}
      </div>
    )
  }
  return <DateTime {...props} />
}

export default class DataTime extends Component {
  render() {
    const {
      field,
      getFieldDecorator,
      popupContainerId,
      disabled,
      fieldMinCol,
      targetWrapper,
      secrecy,
      source,
      initialValue,
      formLayoutType
    } = this.props
    const { defaultValue } = field
    let initialValueFormat
    if (source === 'trigger') {
      if (initialValue) {
        if (Number(initialValue) === 2) {
          initialValueFormat = undefined
        } else if (Number(initialValue) === 1) {
          initialValueFormat = moment()
        } else {
          initialValueFormat = Object.is(NaN, Number(initialValue))
            ? moment(initialValue)
            : moment(Number(initialValue))
        }
      }
    } else {
      // defaultValue === 2  无默认时间
      // defaultValue === 1  当前系统时间
      // 处理alert那边带的参数，itsm这里存的是带时区的时间，alert那边传递的是时间戳
      if (defaultValue) {
        if (Number(defaultValue) === 2) {
          initialValueFormat = undefined
        } else if (Number(defaultValue) === 1) {
          initialValueFormat = moment()
        } else {
          initialValueFormat = Object.is(NaN, Number(defaultValue))
            ? moment(defaultValue)
            : moment(Number(defaultValue))
        }
      }
    }

    const componentProps = {
      disabled,
      field,
      popupContainerId
    }

    const Comp = secrecy ? Secrecy : DateTimeWrap
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValueFormat,
          rules: [
            {
              required: field.isRequired === 1,
              message: `${i18n('ticket.forms.pinput', '请输入')}${field.name}`
            }
          ],
          normalize: (value) => {
            const val = Number(value)

            if (moment.isMoment(value)) return value
            if (value == null || value === '') return undefined
            if (_.isNumber(val) && !Object.is(val, NaN)) return moment(Number(value))
            if (moment(value, 'YYYY-MM-DDTHH:mm:ss.SSSZ', true)) return moment(value)
          }
        })(
          targetWrapper ? (
            targetWrapper({
              code: field.code,
              props: componentProps,
              component: Comp
            })
          ) : (
            <Comp {...componentProps} />
          )
        )}
      </FormItem>
    )
  }
}
