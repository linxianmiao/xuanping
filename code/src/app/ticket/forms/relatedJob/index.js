import React, { Component } from 'react'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import Job from './job'
import './index.less'

export default class RelateJob extends Component {
  render() {
    const {
      field,
      getFieldDecorator,
      initialValue,
      type,
      disabled,
      ticketId,
      fieldMinCol,
      secrecy,
      jobList,
      getAgainDetailForms,
      modelId,
      modelCode,
      formLayoutType
    } = this.props
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValue || undefined,
          rules: [
            {
              type: 'array',
              required: +field.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${field.name}`
            }
          ]
        })(
          secrecy ? (
            <Secrecy />
          ) : (
            <Job
              ticketId={ticketId}
              modelId={modelId}
              modelCode={modelCode}
              disabled={disabled}
              field={field}
              jobList={jobList}
              type={type}
              getAgainDetailForms={getAgainDetailForms}
            />
          )
        )}
      </FormItem>
    )
  }
}
