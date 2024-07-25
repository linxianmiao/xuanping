import React, { Component, Fragment } from 'react'
import { Form, Input, Select, Row, Col } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import { formItemLayout } from '../config/config'
import TriggerUser from '../components/triggerUser'

const FormItem = Form.Item

const { Option, OptGroup } = Select

const parseTicketField = code => '${' + `ticket.${code}` + '}'

const getParamOptions = params => params.map(({ name, code }) => <Option value={parseTicketField(code)} key={code}>{name}</Option>)

@inject('triggerStore')
@observer
export default class SendEmail extends Component {
  handleSelect = code => value => {
    const { getFieldValue, setFieldsValue } = this.props.form
    const oldValue = getFieldValue(code)
    setFieldsValue({ [code]: oldValue + value })
  }

  addPrefix = code => `${this.props.type}_${code}`

  renderFormItem = ({ label, code }) => {
    const { form: { getFieldDecorator }, data, triggerStore } = this.props

    const { titleParams, builtinParams, defineParams } = triggerStore.fieldParams

    const fieldCode = this.addPrefix(code)

    return (
      <FormItem {...formItemLayout} label={label}>
        <Row gutter={8}>
          <Col span={16}>
            {getFieldDecorator(fieldCode, {
              initialValue: data[code],
              rules: [{ required: true }]
            })(<Input />)}
          </Col>
          <Col span={8}>
            <Select
              placeholder={i18n('trigger.sendEmail.inputVariable', '插入变量')}
              onChange={this.handleSelect(fieldCode)}
            >
              <OptGroup label={i18n('trigger.sendEmail.titleParams', '系统属性')}>
                {getParamOptions(titleParams)}
              </OptGroup>
              <OptGroup label={i18n('trigger.sendEmail.builtinParams', '内置字段')}>
                {getParamOptions(builtinParams)}
              </OptGroup>
              <OptGroup label={i18n('trigger.sendEmail.defineParams', '自定义字段')}>
                {getParamOptions(defineParams)}
              </OptGroup>
            </Select>
          </Col>
        </Row>
      </FormItem>
    )
  }

  render() {
    const { form: { getFieldDecorator }, data } = this.props
    return (
      <Fragment>

        {this.renderFormItem({ code: 'title', label: i18n('tirgger.sendEmail.title', '邮件主题') })}

        <FormItem {...formItemLayout} label={i18n('trigger.sendEmail.acceptor', '收件人')}>
          {getFieldDecorator(this.addPrefix('acceptor'), {
            initialValue: data.acceptor || [],
            rules: [{ required: true }]
          })(<TriggerUser />)}
        </FormItem>

        {this.renderFormItem({ code: 'content', label: i18n('tirgger.sendEmail.content', '邮件内容') })}

      </Fragment>
    )
  }
}
