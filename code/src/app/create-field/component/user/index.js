import React, { Component } from 'react'
import { Form, Radio } from '@uyun/components'
import { toJS } from 'mobx'
import UserConfig from './userConfig'
import { Common } from '../index'
import CurrentDefault from './CurrentDefault'
import configList from '../config'

const FormItem = Form.Item
const RadioGroup = Radio.Group

const isSingleOptions = [
  { value: '0', label: i18n('field_value_user_listSel', '单选') },
  { value: '1', label: i18n('field_value_user_multiSelect', '多选') }
]

/**
 * 新建人员字段时：
 * 选择类型为单选，默认值为当前用户 （缺省值）
 *
 * 编辑人员字段时：
 * 以接口的返回数据为渲染依据
 *
 * 改变选择类型时：
 * 1. 选择单选，默认值选择当前用户，则指定用户的人员选择组件隐藏
 * 2. 选择单选，默认值选择指定用户，则人员选择组件的值为接口返回的值（如果接口返回多个值，只取第一个值）
 * 3. 选择多选，则该是啥样就是啥样，不须特殊处理
 * PS：改变选择类型时，人员选择组件会做相应的变化（单选 or 多选）
 *
 * 额外的交互优化：
 * 1. 如果选中了指定用户，但人员选择组件没有选择任何一个人，则保存后再次进来时，不会选中指定用户
 * （但这里后端也做了额外处理，defaultValue 为 null 时会返回空数组，导致该优化暂时不生效， 2020-6-11）
 *
 */

class User extends Component {
  handleRaidoChange = (e) => {
    const { currUser = true, defaultValue = null } = toJS(this.props.fieldData)
    let currDefault
    if (e.target.value === '0') {
      // 单选：
      // 选中当前用户时，指定用户要置为null
      // 选中指定用户时，如果指定用户有多个，则只取第一个值
      let dv
      if (currUser) {
        dv = null
      } else {
        dv = Array.isArray(defaultValue) ? defaultValue.slice(0, 1) : defaultValue
      }
      currDefault = { currUser, defaultValue: dv }
    } else {
      // 多选
      currDefault = { currUser, defaultValue }
    }
    this.props.form.setFieldsValue({ currDefault })
  }

  render() {
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const { formItemLayout, fieldData, modelId, source } = this.props

    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: source === 'dataBase' ? configList(UserConfig) : UserConfig,
      type: 'user',
      modelId,
      fieldCode: getFieldValue('code')
    })
    const isSingleValue = getFieldValue('isSingle')
    // 第一次进来的时候 isSingleValue 还没有值，默认应该是单选
    const isSingleBoolean = typeof isSingleValue === 'undefined' || isSingleValue === '0'

    const { currUser = true, isSingle = '0', defaultValue = null } = toJS(fieldData)
    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={i18n('field_value_user_isSingle', '选择类型')}>
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
            initialValue: { currUser, defaultValue }
          })(
            <CurrentDefault
              isSingle={isSingleBoolean}
              modelId={modelId}
              fieldCode={getFieldValue('code')}
              source={source}
            />
          )}
        </FormItem>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: (props) => {
    props.onValuesChange && props.onValuesChange()
  }
})(User)
