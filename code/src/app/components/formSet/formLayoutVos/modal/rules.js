import React, { Component } from 'react'
import { Form } from '@uyun/components'
import Conditions from './Conditions'
import Variables from './Variables'
import { CONDITION_FIELD_TYPE } from '../configuration'

const FormItem = Form.Item
const FormItemLayout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } }

export default class RelateIndex extends Component {
  render() {
    const { cid, item, field, allFields, linkSource } = this.props

    // 可选字段
    const fields = _.filter(allFields, (field) => {
      if (!_.includes(CONDITION_FIELD_TYPE, field.type)) {
        return false
      }
      if (field.type === 'cascader' && field.tabStatus === '2') {
        return false
      }
      return true
    })

    return (
      <div className="form-set-field-script-item">
        <FormItem {...FormItemLayout} label={i18n('conf.model.linkage.strategy.tip5', '变动内容')}>
          <Variables
            field={field}
            value={item}
            linkSource={linkSource}
            onChange={(value) => this.props.handleChange(value, cid)}
          />
        </FormItem>
        <FormItem {...FormItemLayout} label={i18n('condition.setting', '条件设置')}>
          <Conditions
            fields={fields}
            data={item}
            onChange={(value) => this.props.handleChange(value, cid)}
          />
        </FormItem>
      </div>
    )
  }
}
