import React, { Component } from 'react'
import { Form, Radio } from '@uyun/components'
import { toJS } from 'mobx'
import CommonConfig from '../../config/commonConfig'
import { Common } from '../index'
import CurrentDefault from './CurrentDefault'
import configList from '../config'

const FormItem = Form.Item
const RadioGroup = Radio.Group

const isSingleOptions = [
  { value: '0', label: i18n('field_value_depart_listSel', '单选') },
  { value: '1', label: i18n('field_value_depart_multiSelect', '多选') }
]

class Index extends Component {
  handleRaidoChange = (e) => {
    const { curr_depart = true, defaultValue = null } = toJS(this.props.fieldData)
    let currDefault
    if (e.target.value === '0') {
      // 单选：
      // 选中当前用户时，指定用户要置为null
      // 选中指定用户时，如果指定用户有多个，则只取第一个值
      let dv
      if (curr_depart) {
        dv = null
      } else {
        dv = Array.isArray(defaultValue) ? defaultValue.slice(0, 1) : defaultValue
      }
      currDefault = { curr_depart, defaultValue: dv }
    } else {
      // 多选
      currDefault = { curr_depart, defaultValue }
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
      type: 'department'
    })
    const isSingleBoolean = getFieldValue('isSingle') === '0'

    const { curr_depart = true, isSingle = '0', defaultValue = null } = toJS(fieldData)
    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={i18n('field_value_depart_isSingle', '选择类型')}>
          {getFieldDecorator('isSingle', {
            initialValue: isSingle,
            rules: [{ required: true }]
          })(
            <RadioGroup onChange={this.handleRaidoChange}>
              {isSingleOptions.map(({ value, label }) => (
                <Radio value={value} key={value}>
                  {label}
                </Radio>
              ))}
            </RadioGroup>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('default_department', '默认值')}>
          {getFieldDecorator('currDefault', {
            initialValue: { curr_depart, defaultValue }
          })(<CurrentDefault isSingle={isSingleBoolean} source={source} />)}
        </FormItem>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: (props) => {
    props.onValuesChange && props.onValuesChange()
  }
})(Index)
