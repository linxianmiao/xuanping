import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Col, Button, message } from '@uyun/components'
import { renderField } from '~/ticket/forms/utils/renderField'
import * as R from 'ramda'

function parseFieldValue(value) {
  if (R.isNil(value)) return null
  return value
  // if (Array.isArray(value)) return value
  // return [value] // 这里为什么要做成数组? :后端要求的。
}

function parseParams(values, list) {
  return Object.keys(values).map((key) => {
    const field = list.find((item) => item.code === key) || {}
    return {
      fieldCode: key,
      fieldValue: parseFieldValue(values[key]),
      fieldId: field.id,
      fieldType: field.type
    }
  })
}

@inject('tableListStore')
@observer
@Form.create()
export default class Fields extends Component {
  handleSubmit = () => {
    this.props.form.validateFields(async (error, values) => {
      if (error) return
      if (!this.props.tableListStore.validate()) return
      const { list } = this.props
      const changeFieldParams = parseParams(values, list)
      if (changeFieldParams.length === 0) return
      const { ticketId, modelId, tacheId } = this.props

      await this.props.tableListStore.saveTableData(true) // 保存表格字段数据

      const result = await this.props.updateTicketForm({
        ticketId,
        modelId,
        changeFieldParams,
        tacheId
      })
      if (result === 'success') {
        message.success(i18n('update-fields-success', '更新数据成功'))
        this.props.onSuccess()
      }
    })
  }

  render() {
    const { list, ticketId, forms } = this.props
    if (list.length === 0) return null
    const formDom = []
    let cols = 0
    list.forEach((field, index) => {
      const dilver = {
        forms,
        field,
        ticketId,
        initialValue: field.defaultValue,
        disabled: false,
        form: this.props.form,
        ...R.pick(
          [
            'getFieldDecorator',
            'setFieldsValue',
            'getFieldValue',
            'getFieldsError',
            'getFieldError'
          ],
          this.props.form
        )
      }
      const { fieldLayout } = field
      const col = fieldLayout ? fieldLayout.col : field.fieldLine === 2 ? 12 : 24
      cols = cols + col
      if (cols > 24) {
        formDom.push(<Col key={index} span={24} style={{ height: '1px' }} />)
        cols = 0 + col
      }
      formDom.push(
        <Col span={col} key={field.id || `${field.type}${index}`}>
          {renderField(field, dilver)}
        </Col>
      )
    })

    return (
      <div className="ticket-change-fields">
        <Form>
          <div className="clearfix">{formDom}</div>
        </Form>
        <div>
          <Button onClick={this.handleSubmit} type="primary">
            {i18n('submit', '提交')}
          </Button>
        </div>
      </div>
    )
  }
}
