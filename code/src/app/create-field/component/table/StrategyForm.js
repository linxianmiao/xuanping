import React, { Component } from 'react'
import { Form, Input, Alert } from '@uyun/components'
import { getConstValue, getApiValue, getHideValue } from './config'
import ObservableCell from './ObservableCell'
import Widgets from './Widgets'
const FormItem = Form.Item

@Form.create()
export default class StrategyForm extends Component {
  getRules = (visible) => {
    const { constRules, apiRules, hideRules } = this.props.strategy || {}
    switch (visible) {
      case 'const' : return constRules || [getConstValue()]
      case 'api' : return apiRules || [getApiValue()]
      case 'hide' : return hideRules || [getHideValue()]
      default:return null
    }
  }

  _renderMes = (visible) => {
    switch (visible) {
      case 'const' : return i18n('table-strategy-tip1', '满足当输入列值后自动改变其他列值的场景')
      case 'api' : return i18n('table-strategy-tip2', ' 满足获取第三方数据，当输入列值后自动填充其他列的第三方数据')
      case 'hide' : return i18n('table-strategy-tip3', '满足当输入列值后自动隐藏其他列的场景')
      default:return null
    }
  }

  render() {
    const { formItemLayout, strategy, columns, visible, fields, strategyList, isError } = this.props
    const { getFieldDecorator, getFieldValue } = this.props.form
    const { name, observableCell, description } = strategy || {}
    return (
      <Form>
        <FormItem><Alert type="info" showIcon message={this._renderMes(visible)} /></FormItem>
        <FormItem label={i18n('conf.model.field.card.name', '名称')} {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: name || undefined,
            rules: [{
              required: true, message: i18n('ticket.forms.pinputName', '请输入名称')
            }]
          })(
            <Input placeholder={i18n('ticket.forms.pinputName', '请输入名称')} maxLength={20} />
          )}
        </FormItem>
        <FormItem label={i18n('table-strategy-observableCell', '监听列')} {...formItemLayout}>
          {getFieldDecorator('observableCell', {
            initialValue: observableCell || undefined,
            rules: [{
              required: true, message: i18n('globe.select', '请选择')
            }]
          })(
            <ObservableCell columns={columns} />
          )}
        </FormItem>
        <FormItem label={i18n('table-strategy-rules', '关联列')} {...formItemLayout} required>
          {getFieldDecorator('rules', {
            initialValue: this.getRules(visible)
          })(
            <Widgets
              observableCell={getFieldValue('observableCell')}
              visible={visible}
              fields={fields}
              columns={columns}
              isError={isError}
              strategyList={strategyList}
            />
          )}
        </FormItem>
        <FormItem label={i18n('listSel.input_tips3', '描述')} {...formItemLayout}>
          {getFieldDecorator('description', {
            initialValue: description || undefined
          })(
            <Input.TextArea
              placeholder={i18n('ticket.forms.pinput', '请输入')}
              maxLength={50} />
          )}
        </FormItem>
      </Form>
    )
  }
}
