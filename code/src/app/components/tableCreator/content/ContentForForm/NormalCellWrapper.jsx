import React, { Component } from 'react'
import { Input, InputNumber } from '@uyun/components'
import { Select as SelectWithColor } from '~/components/SelectWithColor'
import Links from '~/ticket/forms/links/Links'
import NormalSelect from '../../cell/normalSelect'
import SingleRowText from '../../cell/SingleRowText'
import MultiRowText from '../../cell/MultiRowText'
import Attachfile from '~/ticket/forms/attachfile/ModeSelect'
import DatePicker from '~/components/TicketDate'
import Cascader from '../../cell/Cascader'
import { getDateTimeValue } from '~/public/logic/dateTime'

/**
 * 除外部数据源的下拉字段以外的字段
 */
export default class NormalCellWrapper extends Component {
  shouldComponentUpdate(nextProps) {
    const { value, disabled, field } = this.props

    if (
      !_.isEqual(value, nextProps.value) ||
      disabled !== nextProps.disabled ||
      !_.isEqual(field, nextProps.field)
    ) {
      return true
    }

    return false
  }

  render() {
    const { type, field, value, disabled, onChange, ticketId, tacheId, tableColCode } = this.props

    switch (type) {
      // case 'normal':
      //   return (
      //     <Input
      //       disabled={disabled}
      //       placeholder={i18n('ticket.forms.pinput', '请输入')}
      //       value={value}
      //       onChange={e => onChange(e.target.value)}
      //     />
      //   )
      case 'normal':
      case 'singleRowText':
        return (
          <SingleRowText
            field={field}
            disabled={disabled}
            placeholder={i18n('ticket.forms.pinput', '请输入')}
            value={value}
            onChange={onChange}
            size="small"
          />
        )
      case 'multiRowText':
        return (
          <MultiRowText
            field={field}
            disabled={disabled}
            placeholder={i18n('ticket.forms.pinput', '请输入')}
            value={value}
            onChange={onChange}
            size="small"
          />
        )
      case 'singleSel':
        return (
          <SelectWithColor
            disabled={disabled}
            isChooseColor={field.isChooseColor}
            options={field.params}
            value={value}
            onChange={onChange}
            size="small"
          />
        )
      case 'multiSel':
        return (
          <NormalSelect
            mode="multiple"
            field={field}
            disabled={disabled}
            options={field.params}
            value={value}
            onChange={onChange}
            size="small"
          />
        )
      case 'listSel':
        return field.tabStatus === '0' ? (
          <NormalSelect
            mode={field.isSingle === '1' ? 'multiple' : ''}
            field={field}
            disabled={disabled}
            options={field.params}
            value={value}
            onChange={onChange}
            size="small"
          />
        ) : null
      case 'links':
        return <Links disabled={disabled} value={value || {}} onChange={onChange} size="small" />
      case 'int':
        return (
          <React.Fragment>
            <InputNumber
              disabled={disabled}
              precision={0}
              min={field.intMin || 0}
              max={field.intMax || Number.MAX_SAFE_INTEGER}
              value={value}
              onChange={onChange}
              size="small"
            />
            <span style={{ color: '#6ca4cd' }}>{field.unit}</span>
          </React.Fragment>
        )
      case 'double':
        return (
          <React.Fragment>
            <InputNumber
              disabled={disabled}
              min={field.doubleMin || 0}
              max={field.doubleMax || Number.MAX_SAFE_INTEGER}
              step={typeof field.precision === 'number' ? 1 / Math.pow(10, field.precision) : 0.01}
              precision={typeof field.precision === 'number' ? field.precision : 2}
              value={value}
              onChange={onChange}
              size="small"
            />
            <span style={{ color: '#6ca4cd' }}>{field.unit}</span>
          </React.Fragment>
        )
      case 'dateTime':
        return (
          <DatePicker
            style={{ width: '100%' }}
            field={field}
            disabled={disabled}
            value={getDateTimeValue(value)}
            onChange={onChange}
            size="small"
            popupContainerId="ticket-forms-wrap"
          />
        )
      case 'attachfile':
        return (
          <Attachfile
            disabled={!ticketId || disabled}
            value={value || []}
            field={field}
            ticketId={ticketId}
            tacheId={tacheId}
            onChange={onChange}
            tableColCode={tableColCode}
            size="small"
          />
        )
      case 'cascader':
        return (
          <Cascader
            disabled={disabled}
            value={value}
            field={field}
            onChange={onChange}
            size="small"
          />
        )
      default:
        return null
    }
  }
}
