import React, { Component } from 'react'
import { Form, Radio } from '@uyun/components'
import { toJS } from 'mobx'
import { Common } from '../index'
import CurrentDefault from './currentDefault'
import CommonConfig from '../../config/commonConfig'
import configList from '../config'

const isSingleOptions = [
  { value: '0', label: i18n('field_value_user_listSel', '单选') },
  { value: '1', label: i18n('field_value_user_multiSelect', '多选') }
]

class UserGroup extends Component {
  handleRaidoChange = (e) => {
    const { curUserGroup = true, defaultValue = null } = toJS(this.props.fieldData)
    let currDefault
    if (e.target.value === '0') {
      let dv
      if (curUserGroup) {
        dv = null
      } else {
        dv = Array.isArray(defaultValue) ? defaultValue.slice(0, 1) : defaultValue
      }
      currDefault = { curUserGroup, defaultValue: dv }
    } else {
      // 多选
      currDefault = { curUserGroup, defaultValue }
    }
    this.props.form.setFieldsValue({ currDefault })
  }

  render() {
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const { formItemLayout, fieldData, source } = this.props

    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: source === 'dataBase' ? configList(CommonConfig) : CommonConfig,
      type: 'userGroup'
    })
    const isSingleValue = getFieldValue('isSingle')
    const isSingleBoolean = typeof isSingleValue === 'undefined' || isSingleValue === '0'
    const { curUserGroup = true, isSingle = '0', defaultValue = null } = toJS(fieldData)
    return (
      <Common {...diliver}>
        <Form.Item {...formItemLayout} label={i18n('field_value_user_isSingle', '选择类型')}>
          {getFieldDecorator('isSingle', {
            initialValue: isSingle,
            rules: [{ required: true }]
          })(
            <Radio.Group onChange={this.handleRaidoChange}>
              {isSingleOptions.map(({ value, label }) => (
                <Radio value={value} key={value}>
                  {label}
                </Radio>
              ))}
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item {...formItemLayout} label={i18n('default_department', '默认值')}>
          {getFieldDecorator('currDefault', {
            initialValue: { curUserGroup, defaultValue }
          })(<CurrentDefault isSingle={isSingleBoolean} source={source} />)}
        </Form.Item>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: (props) => {
    props.onValuesChange && props.onValuesChange()
  }
})(UserGroup)
