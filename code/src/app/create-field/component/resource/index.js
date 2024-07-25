import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Form, Select } from '@uyun/components'
import { observer } from 'mobx-react'
import ResourceConfig from './resourceConfig'
import { Common } from '../index'
const FormItem = Form.Item
const Option = Select.Option
@observer
class Resource extends Component {
  componentDidMount() {
    const { formType = 'ALL' } = this.props.store.fieldData
    this.props.store.queryAllResType({ formType })
  }

  render() {
    const { formItemLayout } = this.props
    const { expandField, fieldData } = this.props.store
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
      config: ResourceConfig,
      type: 'resource'
    })

    const defaultAttributeColumns = _.map(toJS(fieldData.attributeColumns), (ex) => ({
      label: ex.name,
      key: ex.code
    }))
    const defaultCustomColumns = _.map(toJS(fieldData.customColumns), (ex) => ({
      label: ex.name,
      key: ex.code
    }))

    const selectedAttributeColumns = getFieldValue('attributeColumns') || defaultAttributeColumns
    const selectedCustomColumns = getFieldValue('customColumns') || defaultCustomColumns

    const isSingle = getFieldValue('isSingle') === '1'

    return (
      <Common {...diliver}>
        {isSingle && (
          <FormItem {...formItemLayout} label={i18n('ticket.create.selectList', '固定列')}>
            {getFieldDecorator('attributeColumns', {
              initialValue: defaultAttributeColumns || undefined
            })(
              <Select
                mode="multiple"
                showSearch
                allowClear
                labelInValue
                optionFilterProp="children"
                placeholder={i18n('ticket.create.select', '请选择')}
                notFoundContent={i18n('globe.notFound', '无法找到')}
              >
                {_.map(expandField, (param) => {
                  const disabled = selectedCustomColumns.some((item) => item.key === param.code)
                  return (
                    <Option key={param.code} value={param.code} disabled={disabled}>
                      {param.name}
                    </Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
        )}

        {isSingle && (
          <FormItem {...formItemLayout} label={i18n('optional.column', '可选列')}>
            {getFieldDecorator('customColumns', {
              initialValue: defaultCustomColumns || undefined
            })(
              <Select
                mode="multiple"
                showSearch
                allowClear
                labelInValue
                optionFilterProp="children"
                placeholder={i18n('ticket.create.select', '请选择')}
                notFoundContent={i18n('globe.notFound', '无法找到')}
              >
                {_.map(expandField, (param) => {
                  const disabled = selectedAttributeColumns.some((item) => item.key === param.code)
                  return (
                    <Option key={param.code} value={param.code} disabled={disabled}>
                      {param.name}
                    </Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
        )}
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: (props) => {
    props.onValuesChange && props.onValuesChange()
  }
})(Resource)
