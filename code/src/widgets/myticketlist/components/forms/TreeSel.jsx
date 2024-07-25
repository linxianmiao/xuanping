import React, { Component } from 'react'
import { Form, TreeSelect } from '@uyun/components'
import { inject } from '@uyun/core'
const FormItem = Form.Item
const SHOW_PARENT = TreeSelect.SHOW_PARENT

export default class ItsmTreeSelect extends Component {
  @inject('i18n') i18n
  render() {
    const { item, formItemLayout, getFieldDecorator, defaultValue, disabled } = this.props
    return (
      <FormItem label={''} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <TreeSelect
            disabled={disabled}
            allowClear
            multiple
            treeCheckable
            treeDefaultExpandAll
            treeNodeFilterProp="label"
            size="small"
            showCheckedStrategy={SHOW_PARENT}
            treeData={item.treeVos}
            placeholder={`请选择${item.name}`}
          />
        )}
      </FormItem>
    )
  }
}
