import React, { Component } from 'react'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import { inject, observer } from 'mobx-react'
import CustomizeField from '~/create-field/component/customizeField'
import classnames from 'classnames'
@inject('loadFieldWidgetStore')
@observer
export default class Field extends Component {
  componentWillUnmount() {
    // 字段组件卸载时，在loadFieldWidgetStore中去掉该字段信息
    // 防止下一次加载时，调用的onSubmit方法是上一次的缓存
    const { code } = this.props.field
    const { widgetsEvent, registeredWidgetsEventCode } = this.props.loadFieldWidgetStore

    this.props.loadFieldWidgetStore.setProps({
      widgetsEvent: widgetsEvent.filter((item) => item.code !== code),
      registeredWidgetsEventCode: registeredWidgetsEventCode.filter((item) => item !== code)
    })
  }

  // 校验触发两次（疑点）
  validator = (rule, value, callback) => {
    if (this.view && _.isFunction(this.view.validator)) {
      this.view.validator(rule, value, callback)
    } else {
      if (rule.required && !value) {
        callback(`${i18n('globe.select', '请选择')}${this.props.field.name}`)
      } else {
        callback()
      }
    }
  }

  formRef = (node) => {
    this.view = node

    if (node) {
      const { onSubmit, onCancel } = node
      const { code, type, name } = this.props.field
      const { widgetsEvent, registeredWidgetsEventCode } = this.props.loadFieldWidgetStore
      if (!_.includes(registeredWidgetsEventCode, code)) {
        const fieldEvent = {
          code,
          name,
          type,
          onSubmit: _.isFunction(onSubmit) ? onSubmit : undefined,
          onCancel: _.isFunction(onCancel) ? onCancel : undefined
        }
        this.props.loadFieldWidgetStore.setProps({
          widgetsEvent: [...widgetsEvent, fieldEvent],
          registeredWidgetsEventCode: [...registeredWidgetsEventCode, code]
        })
      }
    }
  }

  render() {
    const {
      field,
      getFieldDecorator,
      initialValue,
      disabled,
      fieldMinCol,
      form,
      forms,
      type,
      secrecy,
      formLayoutType
    } = this.props
    const { customFieldList } = this.props.loadFieldWidgetStore
    const { setFieldsValue, getFieldsValue } = form
    let prevValue = null
    let allValue = getFieldsValue()
    const customField = _.find(customFieldList, (item) => item.type === field.type) || {}
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValue,
          rules: [
            {
              required: +field.isRequired === 1,
              validator: this.validator
            }
          ],
          validateTrigger: _.get(customField, 'validateTrigger') || 'onChange',
          normalize: (value, prevVal, allValues) => {
            prevValue = prevVal
            allValue = _.assign({}, allValue, allValues)
            return value
          }
        })(
          secrecy ? (
            <Secrecy />
          ) : (
            <CustomizeField
              field={field}
              id={field.code}
              forms={forms}
              disabled={disabled}
              allValue={allValue}
              prevValue={prevValue}
              formRef={this.formRef}
              preview={type === 'preview'}
              setFieldsValue={setFieldsValue}
              type={field.type}
              widgetType="view"
            />
          )
        )}
      </FormItem>
    )
  }
}
